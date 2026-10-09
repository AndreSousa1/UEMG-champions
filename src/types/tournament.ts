/**
 * Modelos de dados do campeonato.
 *
 * Este arquivo só contém tipos. Os valores editáveis ficam em:
 *  - src/config/tournament.config.ts  (nome, datas, horários, durações, logo, exibição)
 *  - src/data/teams.ts                (equipes)
 *  - src/data/matches.ts              (partidas, chaveamento e resultados)
 */

/* ------------------------------------------------------------------ */
/* Primitivos                                                          */
/* ------------------------------------------------------------------ */

export type SeriesFormat = 'MD1' | 'MD3';

export type StageId = 'preliminary' | 'quarterfinal' | 'semifinal' | 'final';

type Digit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
export type Hour = `${'0' | '1'}${Digit}` | `2${'0' | '1' | '2' | '3'}`;
export type Minute = `${'0' | '1' | '2' | '3' | '4' | '5'}${Digit}`;
/** Horário no formato 24h "HH:MM", ex.: "19:00". */
export type TimeOfDay = `${Hour}:${Minute}`;
/** Data no formato "AAAA-MM-DD", ex.: "2026-10-12". */
export type IsoDate = `${number}-${number}-${number}`;

/* ------------------------------------------------------------------ */
/* Configuração                                                        */
/* ------------------------------------------------------------------ */

export type TournamentPhase = 'not-started' | 'in-progress' | 'completed';

export interface PublicLink {
  label: string;
  url: string;
  kind?: 'site' | 'social' | 'stream' | 'other';
}

export interface ScheduleDayConfig {
  /** Horário de início da primeira partida do dia. */
  startTime: TimeOfDay;
}

export interface ScheduleConfig {
  /** Fuso horário IANA usado para todos os horários do evento. */
  timeZone: string;
  /** Texto exibido ao lado dos horários. */
  timeZoneLabel: string;
  /** Dias do evento. A chave é a data "AAAA-MM-DD". */
  days: Readonly<Record<string, ScheduleDayConfig>>;
  /** Duração estimada de cada formato, em minutos. */
  durationsMinutes: Readonly<Record<SeriesFormat, number>>;
  /** Intervalo entre o fim previsto de uma partida e o início da próxima, em minutos. */
  gapMinutes: number;
}

export interface StageConfig {
  label: string;
  shortLabel: string;
  description: string;
}

export interface LogoConfig {
  /** Caminho relativo à pasta public/. */
  src: string;
  alt: string;
  /** Alturas em pixels em cada local de exibição. */
  headerHeight: number;
  footerHeight: number;
  heroHeight: number;
  /** Mostra o nome em texto ao lado da logo no cabeçalho. */
  showNameNextToLogoInHeader: boolean;
}

export interface PublicDisplayConfig {
  showPlayers: boolean;
  showReserve: boolean;
  showTeamLinks: boolean;
  showCompetitiveLevel: boolean;
  showMatchIds: boolean;
}

export interface TournamentConfig {
  name: string;
  displayName: string;
  tagline: string;
  game: string;
  year: number;
  formatLabel: string;
  logo: LogoConfig;
  schedule: ScheduleConfig;
  stages: Readonly<Record<StageId, StageConfig>>;
  /** Força a situação do campeonato. Use null para cálculo automático. */
  phaseOverride: TournamentPhase | null;
  /** Simula outra data/hora (ISO 8601) para pré-visualização. Use null em produção. */
  clockOverride: string | null;
  publicDisplay: PublicDisplayConfig;
  officialLinks: readonly PublicLink[];
  organization: {
    name: string | null;
    description: string | null;
  };
  theme: {
    accent: string;
    accentContrast: string;
  };
}

/* ------------------------------------------------------------------ */
/* Equipes                                                             */
/* ------------------------------------------------------------------ */

export interface PlayerProfile {
  nickname: string;
  /** Nível competitivo. Só aparece se publicDisplay.showCompetitiveLevel e displaySettings.showLevel permitirem. */
  level?: string;
}

export interface TeamDisplaySettings {
  showPlayers?: boolean;
  showReserve?: boolean;
  showLinks?: boolean;
  showLevel?: boolean;
}

export interface TeamDefinition {
  /** Identificador fixo da vaga no campeonato (A–L). Não muda quando o nome muda. */
  id: string;
  name: string;
  shortName: string;
  /** Caminho relativo à pasta public/, ou null. */
  logo: string | null;
  /** true enquanto a equipe usa dados provisórios. */
  isPlaceholder?: boolean;
  players: readonly PlayerProfile[];
  reserve: PlayerProfile | null;
  publicLinks: readonly PublicLink[];
  displaySettings: TeamDisplaySettings;
}

/* ------------------------------------------------------------------ */
/* Partidas                                                            */
/* ------------------------------------------------------------------ */

export type SlotSource<MId extends string = string, TId extends string = string> =
  | { team: TId }
  | { winnerOf: MId };

export interface MapResult {
  /** Nome do mapa, ex.: "Mirage". */
  map?: string;
  /** Rounds [equipe 1, equipe 2]. */
  rounds?: readonly [number, number];
  /** Vencedor do mapa (1 ou 2). Opcional se `rounds` estiver preenchido. */
  winner?: 1 | 2;
}

export type MatchStatus = 'scheduled' | 'live' | 'completed' | 'postponed';

export interface MatchDefinition<
  MId extends string = string,
  TId extends string = string,
  D extends string = string,
> {
  id: MId;
  stage: StageId;
  format: SeriesFormat;
  team1: SlotSource<MId, TId>;
  team2: SlotSource<MId, TId>;
  /** Dia da partida (precisa existir em schedule.days). */
  date: D;
  /** Posição na programação do dia (1 = primeira). */
  order: number;
  /** Horário fixo que substitui o horário calculado. */
  fixedTime?: TimeOfDay;
  status: MatchStatus;
  maps?: readonly MapResult[];
  /** Vitória por W.O. da equipe 1 ou 2 (sem mapas). */
  walkover?: 1 | 2;
  /** Observação pública curta. */
  note?: string;
}

/* ------------------------------------------------------------------ */
/* Modelos calculados                                                  */
/* ------------------------------------------------------------------ */

export interface ScheduledSlot {
  matchId: string;
  date: string;
  start: Date;
  end: Date;
  durationMinutes: number;
  isFixedTime: boolean;
}

export interface EvaluatedMap {
  index: number;
  map: string | null;
  rounds: readonly [number, number] | null;
  winner: 1 | 2;
}

export type ResultEvaluation =
  | { kind: 'none' }
  | { kind: 'partial'; mapWins: [number, number]; maps: EvaluatedMap[] }
  | { kind: 'decided'; winner: 1 | 2; mapWins: [number, number]; maps: EvaluatedMap[]; walkover: boolean }
  | { kind: 'invalid'; reason: string };

export type ResolvedSlot =
  | { kind: 'team'; teamId: string; source: SlotSource }
  | { kind: 'pending'; source: { winnerOf: string } }
  | { kind: 'invalid'; source: SlotSource; reason: string };

export type MatchState = 'scheduled' | 'live' | 'completed' | 'postponed' | 'invalid';

export interface ResolvedMatch {
  definition: MatchDefinition;
  slots: [ResolvedSlot, ResolvedSlot];
  schedule: ScheduledSlot | null;
  result: ResultEvaluation;
  state: MatchState;
  winnerSlot: 1 | 2 | null;
  winnerTeamId: string | null;
  loserTeamId: string | null;
  feedsInto: { matchId: string; slot: 1 | 2 } | null;
  problems: string[];
}

export type IssueSeverity = 'error' | 'warning';

export interface ValidationIssue {
  severity: IssueSeverity;
  message: string;
  matchId?: string;
  teamId?: string;
}

export type TeamStatus =
  | 'awaiting-debut'
  | 'qualified'
  | 'semifinalist'
  | 'finalist'
  | 'champion'
  | 'runner-up'
  | 'eliminated';

export interface TeamStanding {
  teamId: string;
  status: TeamStatus;
  label: string;
  wins: number;
  /** Etapa de entrada da equipe no chaveamento. */
  entryStage: StageId | null;
  eliminatedIn: StageId | null;
  placement: string | null;
  nextMatchId: string | null;
  lastCompletedMatchId: string | null;
}
