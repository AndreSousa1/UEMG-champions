import type { MatchDefinition, TeamDefinition, TournamentConfig, ValidationIssue } from '../types/tournament';
import { SENSITIVE_KEY_PATTERN, SENSITIVE_VALUE_PATTERNS } from './privacy';
import { isValidTimeZone, parseIsoDate, parseTimeOfDay } from './time';

function collectStrings(value: unknown, path: string, out: { path: string; key: string; value: string }[]): void {
  if (typeof value === 'string') {
    out.push({ path, key: path.split('.').at(-1) ?? '', value });
  } else if (Array.isArray(value)) {
    value.forEach((item, i) => collectStrings(item, `${path}[${i}]`, out));
  } else if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      if (SENSITIVE_KEY_PATTERN.test(key)) out.push({ path: `${path}.${key}`, key, value: '[campo proibido]' });
      collectStrings(child, `${path}.${key}`, out);
    }
  }
}

/** Procura campos ou valores com aparência de dado pessoal no conjunto público de equipes. */
export function findSensitiveData(teams: readonly TeamDefinition[]): string[] {
  const found: string[] = [];
  const strings: { path: string; key: string; value: string }[] = [];
  collectStrings(teams, 'teams', strings);
  for (const { path, key, value } of strings) {
    if (value === '[campo proibido]') {
      found.push(`${path}: campo "${key}" não é permitido nos dados públicos`);
      continue;
    }
    if (key === 'url' || path.endsWith('.logo')) continue;
    for (const { label, pattern } of SENSITIVE_VALUE_PATTERNS) {
      if (pattern.test(value)) found.push(`${path}: valor parece conter ${label}`);
    }
  }
  return found;
}

function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export function validateConfig(config: TournamentConfig): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const { schedule } = config;

  if (!isValidTimeZone(schedule.timeZone)) {
    issues.push({ severity: 'error', message: `Fuso horário inválido: "${schedule.timeZone}".` });
  }
  const days = Object.entries(schedule.days);
  if (days.length === 0) issues.push({ severity: 'error', message: 'Nenhum dia configurado na agenda.' });
  for (const [date, day] of days) {
    if (!parseIsoDate(date)) issues.push({ severity: 'error', message: `Data inválida na agenda: "${date}" (use AAAA-MM-DD).` });
    if (!parseTimeOfDay(day.startTime)) {
      issues.push({ severity: 'error', message: `Horário inicial inválido em ${date}: "${day.startTime}" (use HH:MM).` });
    }
  }
  for (const [format, minutes] of Object.entries(schedule.durationsMinutes)) {
    if (!Number.isInteger(minutes) || minutes <= 0) {
      issues.push({ severity: 'error', message: `Duração de ${format} deve ser um número inteiro positivo de minutos.` });
    }
  }
  if (!Number.isInteger(schedule.gapMinutes) || schedule.gapMinutes < 0) {
    issues.push({ severity: 'error', message: 'O intervalo entre partidas deve ser um número inteiro de minutos (0 ou mais).' });
  }
  for (const link of config.officialLinks) {
    if (!isSafeUrl(link.url)) issues.push({ severity: 'warning', message: `Link oficial "${link.label}" tem URL inválida e foi ocultado.` });
  }
  return issues;
}

export function validateTeams(teams: readonly TeamDefinition[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const ids = new Set<string>();
  const names = new Set<string>();
  for (const team of teams) {
    if (ids.has(team.id)) issues.push({ severity: 'error', teamId: team.id, message: `ID de equipe duplicado: ${team.id}.` });
    ids.add(team.id);
    const normalized = team.name.trim().toLocaleLowerCase('pt-BR');
    if (!normalized) issues.push({ severity: 'error', teamId: team.id, message: `Equipe ${team.id} está sem nome.` });
    else if (names.has(normalized)) issues.push({ severity: 'warning', teamId: team.id, message: `Nome de equipe repetido: "${team.name}".` });
    names.add(normalized);
    const nicknames = [...team.players, ...(team.reserve ? [team.reserve] : [])].map((p) => p.nickname.trim().toLocaleLowerCase('pt-BR'));
    if (new Set(nicknames).size !== nicknames.length) {
      issues.push({ severity: 'warning', teamId: team.id, message: `Equipe ${team.id} tem nicknames repetidos.` });
    }
    for (const link of team.publicLinks) {
      if (!isSafeUrl(link.url)) issues.push({ severity: 'warning', teamId: team.id, message: `Link "${link.label}" da equipe ${team.id} tem URL inválida e foi ocultado.` });
    }
  }
  for (const problem of findSensitiveData(teams)) {
    issues.push({ severity: 'error', message: `Possível dado pessoal nos dados públicos — ${problem}.` });
  }
  return issues;
}

export function validateMatches(config: TournamentConfig, matches: readonly MatchDefinition[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const orders = new Map<string, string>();
  for (const match of matches) {
    if (!config.schedule.days[match.date]) {
      issues.push({ severity: 'error', matchId: match.id, message: `${match.id}: o dia ${match.date} não está configurado na agenda; horário indisponível.` });
    }
    if (!Number.isInteger(match.order) || match.order < 1) {
      issues.push({ severity: 'error', matchId: match.id, message: `${match.id}: "order" deve ser um inteiro a partir de 1.` });
    }
    const key = `${match.date}#${match.order}`;
    const clash = orders.get(key);
    if (clash) issues.push({ severity: 'warning', matchId: match.id, message: `${match.id} e ${clash} têm a mesma ordem no dia ${match.date}.` });
    orders.set(key, match.id);
    if (match.fixedTime !== undefined && !parseTimeOfDay(match.fixedTime)) {
      issues.push({ severity: 'error', matchId: match.id, message: `${match.id}: horário fixo inválido "${match.fixedTime}".` });
    }
  }
  return issues;
}

export { isSafeUrl };
