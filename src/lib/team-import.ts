// Este módulo também é executado diretamente pelo Node (scripts/import-teams.ts),
// por isso só importa tipos ou arquivos com a extensão .ts explícita.
import type { PlayerProfile, TeamDefinition } from '../types/tournament';
import { SENSITIVE_KEY_PATTERN, sensitiveValueLabel } from './privacy.ts';

/** Únicas colunas aceitas na importação. Qualquer outra coluna é recusada. */
export const ALLOWED_COLUMNS = ['equipe_id', 'equipe_nome', 'equipe_sigla', 'nickname', 'funcao', 'ordem', 'publicar'] as const;
const REQUIRED_COLUMNS = ['equipe_id', 'equipe_nome', 'nickname', 'publicar'] as const;

type Column = (typeof ALLOWED_COLUMNS)[number];
type Row = Partial<Record<Column, string>>;

export interface ImportOptions {
  maxPlayers: number;
  maxReserves: number;
}

const DEFAULT_OPTIONS: ImportOptions = { maxPlayers: 5, maxReserves: 1 };

export interface ImportedTeamSummary {
  teamId: string;
  name: string;
  players: string[];
  reserve: string | null;
}

export interface ImportReport {
  ok: boolean;
  errors: string[];
  warnings: string[];
  /** Lista completa de equipes após a importação (somente se ok). */
  teams: TeamDefinition[];
  summary: ImportedTeamSummary[];
}

function normalizeHeader(header: string): string {
  return header
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
}

/** Parser de CSV com suporte a aspas, separador "," ou ";" e quebras de linha CRLF. */
export function parseCsv(text: string): string[][] {
  const content = text.replace(/^\uFEFF/, '');
  const firstLine = content.split(/\r?\n/, 1)[0] ?? '';
  const delimiter = (firstLine.match(/;/g)?.length ?? 0) > (firstLine.match(/,/g)?.length ?? 0) ? ';' : ',';
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i]!;
    if (inQuotes) {
      if (char === '"') {
        if (content[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === delimiter) {
      row.push(field);
      field = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && content[i + 1] === '\n') i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }
  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((cell) => cell.trim() !== ''));
}

function checkColumns(headers: string[], errors: string[]): boolean {
  const normalized = headers.map(normalizeHeader);
  const sensitive: string[] = [];
  const unknown: string[] = [];
  normalized.forEach((header, i) => {
    if ((ALLOWED_COLUMNS as readonly string[]).includes(header)) return;
    if (SENSITIVE_KEY_PATTERN.test(header)) sensitive.push(headers[i]!);
    else unknown.push(headers[i]!);
  });
  if (sensitive.length > 0) {
    errors.push(
      `O arquivo contém colunas com dados pessoais (${sensitive.join(', ')}). Exporte um arquivo apenas com as colunas autorizadas: ${ALLOWED_COLUMNS.join(', ')}.`,
    );
  }
  if (unknown.length > 0) {
    errors.push(`Colunas não reconhecidas: ${unknown.join(', ')}. Colunas aceitas: ${ALLOWED_COLUMNS.join(', ')}.`);
  }
  const missing = REQUIRED_COLUMNS.filter((c) => !normalized.includes(c));
  if (missing.length > 0) errors.push(`Colunas obrigatórias ausentes: ${missing.join(', ')}.`);
  return sensitive.length === 0 && unknown.length === 0 && missing.length === 0;
}

function rowsFromCsv(content: string, errors: string[]): Row[] {
  const table = parseCsv(content);
  if (table.length === 0) {
    errors.push('O arquivo está vazio.');
    return [];
  }
  const headers = table[0]!;
  if (!checkColumns(headers, errors)) return [];
  const keys = headers.map(normalizeHeader) as Column[];
  return table.slice(1).map((cells) => {
    const row: Row = {};
    keys.forEach((key, i) => {
      row[key] = (cells[i] ?? '').trim();
    });
    return row;
  });
}

function rowsFromJson(content: string, errors: string[]): Row[] {
  let data: unknown;
  try {
    data = JSON.parse(content);
  } catch (e) {
    errors.push(`JSON inválido: ${(e as Error).message}`);
    return [];
  }
  if (!Array.isArray(data)) {
    errors.push('O JSON deve ser uma lista de linhas, ex.: [{ "equipe_id": "A", "equipe_nome": "...", "nickname": "...", "publicar": "sim" }].');
    return [];
  }
  const headers = [...new Set(data.flatMap((item) => (item && typeof item === 'object' ? Object.keys(item) : [])))];
  if (!checkColumns(headers, errors)) return [];
  return data.map((item: Record<string, unknown>) => {
    const row: Row = {};
    for (const [key, value] of Object.entries(item ?? {})) {
      row[normalizeHeader(key) as Column] = value === null || value === undefined ? '' : String(value).trim();
    }
    return row;
  });
}

function parseYesNo(value: string | undefined): boolean | null {
  const v = (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
  if (['sim', 's', 'true', '1', 'yes'].includes(v)) return true;
  if (['nao', 'n', 'false', '0', 'no'].includes(v)) return false;
  return null;
}

// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/;

function checkPublicText(value: string, label: string, line: number, maxLength: number, errors: string[]): boolean {
  if (!value) {
    errors.push(`Linha ${line}: ${label} está vazio.`);
    return false;
  }
  if (value.length > maxLength) {
    errors.push(`Linha ${line}: ${label} excede ${maxLength} caracteres.`);
    return false;
  }
  if (CONTROL_CHARS.test(value)) {
    errors.push(`Linha ${line}: ${label} contém caracteres inválidos.`);
    return false;
  }
  const sensitive = sensitiveValueLabel(value);
  if (sensitive) {
    errors.push(`Linha ${line}: ${label} parece conter ${sensitive}. Esse dado não pode ser publicado.`);
    return false;
  }
  return true;
}

interface DraftTeam {
  name: string;
  shortName: string | null;
  players: { nickname: string; order: number; index: number }[];
  reserves: { nickname: string; order: number; index: number }[];
}

/**
 * Importa equipes a partir de um CSV/JSON sanitizado. Nunca altera os dados
 * quando há erros: nesse caso `ok` é false e `teams` fica vazio.
 */
export function importTeams(
  input: { format: 'csv' | 'json'; content: string },
  existing: readonly TeamDefinition[],
  options: Partial<ImportOptions> = {},
): ImportReport {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const errors: string[] = [];
  const warnings: string[] = [];
  const rows = input.format === 'csv' ? rowsFromCsv(input.content, errors) : rowsFromJson(input.content, errors);
  const fail = (): ImportReport => ({ ok: false, errors, warnings, teams: [], summary: [] });
  if (errors.length > 0) return fail();
  if (rows.length === 0) {
    errors.push('Nenhuma linha de dados encontrada.');
    return fail();
  }

  const existingIds = new Map(existing.map((t) => [t.id.toUpperCase(), t.id]));
  const drafts = new Map<string, DraftTeam>();
  const nicknames = new Map<string, string>();
  let hidden = 0;

  rows.forEach((row, index) => {
    const line = index + 2;
    const rawId = (row.equipe_id ?? '').toUpperCase();
    const teamId = existingIds.get(rawId);
    if (!teamId) {
      errors.push(`Linha ${line}: equipe_id "${row.equipe_id ?? ''}" não corresponde a nenhuma vaga (${[...existingIds.values()].join(', ')}).`);
      return;
    }

    const publish = parseYesNo(row.publicar);
    if (publish === null) {
      errors.push(`Linha ${line}: "publicar" deve ser "sim" ou "não".`);
      return;
    }

    const name = row.equipe_nome ?? '';
    if (!checkPublicText(name, 'equipe_nome', line, 60, errors)) return;
    const shortName = row.equipe_sigla ?? '';
    if (shortName && !checkPublicText(shortName, 'equipe_sigla', line, 12, errors)) return;

    let draft = drafts.get(teamId);
    if (!draft) {
      draft = { name, shortName: shortName || null, players: [], reserves: [] };
      drafts.set(teamId, draft);
    } else {
      if (draft.name !== name) {
        errors.push(`Linha ${line}: a equipe ${teamId} aparece com nomes diferentes ("${draft.name}" e "${name}").`);
        return;
      }
      if (shortName && draft.shortName && draft.shortName !== shortName) {
        errors.push(`Linha ${line}: a equipe ${teamId} aparece com siglas diferentes.`);
        return;
      }
      draft.shortName ??= shortName || null;
    }

    if (!publish) {
      hidden++;
      return;
    }

    const nickname = row.nickname ?? '';
    if (!checkPublicText(nickname, 'nickname', line, 32, errors)) return;
    const key = nickname.toLocaleLowerCase('pt-BR');
    const owner = nicknames.get(key);
    if (owner) {
      errors.push(`Linha ${line}: nickname "${nickname}" repetido (já usado na equipe ${owner}).`);
      return;
    }
    nicknames.set(key, teamId);

    const role = (row.funcao ?? '').trim().toLowerCase() || 'titular';
    if (role !== 'titular' && role !== 'reserva') {
      errors.push(`Linha ${line}: "funcao" deve ser "titular" ou "reserva".`);
      return;
    }

    let order = Number.POSITIVE_INFINITY;
    if (row.ordem) {
      const parsed = Number(row.ordem);
      if (!Number.isInteger(parsed) || parsed < 1) {
        errors.push(`Linha ${line}: "ordem" deve ser um número inteiro a partir de 1.`);
        return;
      }
      order = parsed;
    }
    (role === 'titular' ? draft.players : draft.reserves).push({ nickname, order, index });
  });

  const names = new Map<string, string>();
  for (const [teamId, draft] of drafts) {
    const normalized = draft.name.toLocaleLowerCase('pt-BR');
    const other = names.get(normalized);
    if (other) errors.push(`As equipes ${other} e ${teamId} têm o mesmo nome ("${draft.name}").`);
    names.set(normalized, teamId);
    if (draft.players.length > opts.maxPlayers) {
      errors.push(`Equipe ${teamId} tem ${draft.players.length} titulares publicados (máximo ${opts.maxPlayers}).`);
    } else if (draft.players.length < opts.maxPlayers) {
      warnings.push(`Equipe ${teamId} tem ${draft.players.length} de ${opts.maxPlayers} titulares publicados.`);
    }
    if (draft.reserves.length > opts.maxReserves) {
      errors.push(`Equipe ${teamId} tem ${draft.reserves.length} reservas (máximo ${opts.maxReserves}).`);
    }
  }
  for (const team of existing) {
    if (!drafts.has(team.id)) warnings.push(`Equipe ${team.id} não aparece no arquivo e mantém os dados atuais.`);
  }
  if (hidden > 0) warnings.push(`${hidden} jogador(es) com "publicar = não" foram omitidos.`);

  if (errors.length > 0) return fail();

  const byOrder = (a: { order: number; index: number }, b: { order: number; index: number }) => a.order - b.order || a.index - b.index;
  const summary: ImportedTeamSummary[] = [];
  const teams = existing.map((team): TeamDefinition => {
    const draft = drafts.get(team.id);
    if (!draft) return team;
    const players: PlayerProfile[] = [...draft.players].sort(byOrder).map((p) => ({ nickname: p.nickname }));
    const reserve = [...draft.reserves].sort(byOrder)[0];
    const updated: TeamDefinition = {
      ...team,
      name: draft.name,
      shortName: draft.shortName ?? draft.name,
      isPlaceholder: false,
      players,
      reserve: reserve ? { nickname: reserve.nickname } : null,
    };
    summary.push({ teamId: team.id, name: updated.name, players: players.map((p) => p.nickname), reserve: updated.reserve?.nickname ?? null });
    return updated;
  });

  return { ok: true, errors, warnings, teams, summary };
}

const IDENTIFIER = /^[A-Za-z_$][\w$]*$/;

function toTs(value: unknown, indent: string): string {
  if (value === null) return 'null';
  if (typeof value === 'string') return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    const inner = indent + '  ';
    return `[\n${value.map((v) => `${inner}${toTs(v, inner)},`).join('\n')}\n${indent}]`;
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value).filter(([, v]) => v !== undefined);
    if (entries.length === 0) return '{}';
    const inner = indent + '  ';
    return `{\n${entries.map(([k, v]) => `${inner}${IDENTIFIER.test(k) ? k : `'${k}'`}: ${toTs(v, inner)},`).join('\n')}\n${indent}}`;
  }
  throw new Error(`Valor não suportado: ${String(value)}`);
}

/** Gera o conteúdo de src/data/teams.ts a partir da lista de equipes. */
export function renderTeamsFile(teams: readonly TeamDefinition[]): string {
  const ordered = teams.map((t) => ({
    id: t.id,
    name: t.name,
    shortName: t.shortName,
    logo: t.logo,
    ...(t.isPlaceholder ? { isPlaceholder: true } : {}),
    players: t.players,
    reserve: t.reserve,
    publicLinks: t.publicLinks,
    displaySettings: t.displaySettings,
  }));
  return `import type { TeamDefinition } from '../types/tournament';

/**
 * EQUIPES DO UEMG champions
 *
 * - \`id\` identifica a vaga no chaveamento (A–L). Não altere: as partidas usam esse valor.
 * - \`name\` / \`shortName\`: nome e sigla exibidos.
 * - \`logo\`: caminho dentro de public/, ex.: 'assets/teams/equipe-a.png', ou null.
 * - \`players\`: apenas nicknames autorizados para publicação, na ordem desejada.
 * - \`reserve\`: nickname do reserva ou null.
 * - \`publicLinks\`: links públicos autorizados, ex.: { label: 'Instagram', url: 'https://...' }.
 * - \`displaySettings\`: oculta itens desta equipe (players, reserva, links, nível).
 *
 * TUDO o que estiver neste arquivo é público. Nunca inclua CPF, matrícula,
 * e-mail, telefone, nome completo ou qualquer dado administrativo.
 *
 * Gerado por \`npm run import:teams\` e pode ser editado manualmente.
 */
export const teams = ${toTs(ordered, '')} as const satisfies readonly TeamDefinition[];

export type TeamId = (typeof teams)[number]['id'];
`;
}
