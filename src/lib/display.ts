import type {
  MatchState,
  ResolvedMatch,
  ResolvedSlot,
  TeamDefinition,
  TeamStatus,
  TournamentConfig,
  TournamentPhase,
} from '../types/tournament';
import { formatDate, formatDayMonth, formatTime, formatWeekday, isoDateToDisplayInstant } from './time';
import { isSafeUrl } from './validation';

export function assetUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  const base = import.meta.env?.BASE_URL ?? '/';
  return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

export type SlotView =
  | { kind: 'team'; team: TeamDefinition }
  | { kind: 'tbd'; label: string; hint: string }
  | { kind: 'invalid'; label: string; hint: string };

export function slotView(slot: ResolvedSlot, teamsById: ReadonlyMap<string, TeamDefinition>): SlotView {
  if (slot.kind === 'team') {
    const team = teamsById.get(slot.teamId);
    if (team) return { kind: 'team', team };
    return { kind: 'invalid', label: 'Vaga inválida', hint: `Equipe ${slot.teamId} não cadastrada` };
  }
  if (slot.kind === 'pending') return { kind: 'tbd', label: 'A definir', hint: `Vencedor de ${slot.source.winnerOf}` };
  return { kind: 'invalid', label: 'Vaga inválida', hint: slot.reason };
}

export function slotAt(match: ResolvedMatch, slot: 1 | 2): ResolvedSlot {
  return slot === 1 ? match.slots[0] : match.slots[1];
}

export function scoreAt(score: readonly [number, number], slot: 1 | 2): number {
  return slot === 1 ? score[0] : score[1];
}

export const PHASE_LABEL: Record<TournamentPhase, string> = {
  'not-started': 'Não iniciado',
  'in-progress': 'Em andamento',
  completed: 'Concluído',
};

export const MATCH_STATE_LABEL: Record<MatchState, string> = {
  scheduled: 'Agendada',
  live: 'Ao vivo',
  completed: 'Encerrada',
  postponed: 'Adiada',
  invalid: 'Resultado em revisão',
};

export const TEAM_STATUS_TONE: Record<TeamStatus, 'neutral' | 'accent' | 'gold' | 'muted'> = {
  'awaiting-debut': 'neutral',
  qualified: 'accent',
  semifinalist: 'accent',
  finalist: 'accent',
  champion: 'gold',
  'runner-up': 'neutral',
  eliminated: 'muted',
};

/** Placar da série, somente quando há resultado válido para exibir. */
export function seriesScore(match: ResolvedMatch): [number, number] | null {
  if (match.state !== 'live' && match.state !== 'completed') return null;
  if (match.result.kind === 'decided' || match.result.kind === 'partial') return match.result.mapWins;
  return match.state === 'live' ? [0, 0] : null;
}

/** "segunda-feira" -> "Segunda-feira" (o CSS `capitalize` também alteraria a letra após o hífen). */
export function capitalizeFirst(text: string): string {
  return text.charAt(0).toLocaleUpperCase('pt-BR') + text.slice(1);
}

export interface MatchWhen {
  date: string;
  dayMonth: string;
  weekday: string;
  weekdayShort: string;
  time: string;
  endTime: string;
}

export function matchWhen(match: ResolvedMatch, config: TournamentConfig): MatchWhen | null {
  if (!match.schedule) return null;
  const tz = config.schedule.timeZone;
  const { start, end } = match.schedule;
  return {
    date: formatDate(start, tz),
    dayMonth: formatDayMonth(start, tz),
    weekday: capitalizeFirst(formatWeekday(start, tz, 'long')),
    weekdayShort: capitalizeFirst(formatWeekday(start, tz, 'short')),
    time: formatTime(start, tz),
    endTime: formatTime(end, tz),
  };
}

export function dayLabel(date: string, config: TournamentConfig) {
  const tz = config.schedule.timeZone;
  const instant = isoDateToDisplayInstant(date, tz);
  return {
    date: formatDate(instant, tz),
    dayMonth: formatDayMonth(instant, tz),
    weekday: capitalizeFirst(formatWeekday(instant, tz, 'long')),
    weekdayShort: capitalizeFirst(formatWeekday(instant, tz, 'short')),
  };
}

/** Período do evento a partir dos dias configurados, ex.: "12 a 15 de outubro de 2026". */
export function eventPeriod(config: TournamentConfig) {
  const tz = config.schedule.timeZone;
  const dates = Object.keys(config.schedule.days).sort();
  if (dates.length === 0) return { long: 'Datas a definir', short: 'A definir', dayCount: 0 };
  const first = isoDateToDisplayInstant(dates[0]!, tz);
  const last = isoDateToDisplayInstant(dates.at(-1)!, tz);
  const part = (d: Date, o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('pt-BR', { timeZone: tz, ...o }).format(d);
  const sameMonth = part(first, { month: 'numeric', year: 'numeric' }) === part(last, { month: 'numeric', year: 'numeric' });
  const month = part(last, { month: 'long' });
  const monthShort = part(last, { month: 'short' }).replace('.', '').toUpperCase();
  const year = part(last, { year: 'numeric' });
  const d1 = part(first, { day: 'numeric' });
  const d2 = part(last, { day: 'numeric' });
  if (dates.length === 1) {
    return { long: `${d1} de ${month} de ${year}`, short: `${d1} ${monthShort} ${year}`, dayCount: 1 };
  }
  if (sameMonth) {
    return { long: `${d1} a ${d2} de ${month} de ${year}`, short: `${d1}–${d2} ${monthShort} ${year}`, dayCount: dates.length };
  }
  const f1 = formatDayMonth(first, tz);
  const f2 = formatDayMonth(last, tz);
  return { long: `${f1} a ${f2}/${year}`, short: `${f1}–${f2} ${year}`, dayCount: dates.length };
}

export interface TeamVisibility {
  players: boolean;
  reserve: boolean;
  links: boolean;
  level: boolean;
}

export function teamVisibility(team: TeamDefinition, config: TournamentConfig): TeamVisibility {
  const d = team.displaySettings;
  const p = config.publicDisplay;
  return {
    players: p.showPlayers && d.showPlayers !== false,
    reserve: p.showReserve && d.showReserve !== false,
    links: p.showTeamLinks && d.showLinks !== false,
    level: p.showCompetitiveLevel && d.showLevel === true,
  };
}

export function visibleLinks<T extends { url: string }>(links: readonly T[]): T[] {
  return links.filter((l) => isSafeUrl(l.url));
}

export function teamInitials(team: TeamDefinition): string {
  const source = team.shortName.trim() || team.name.trim();
  const words = source.split(/\s+/).filter(Boolean);
  if (team.isPlaceholder) return team.id;
  if (words.length === 1) return words[0]!.slice(0, 3).toUpperCase();
  return words
    .slice(0, 3)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}
