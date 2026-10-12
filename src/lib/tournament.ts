import type {
  LiveStreams,
  MatchDefinition,
  ResolvedMatch,
  TeamDefinition,
  TeamStanding,
  TournamentConfig,
  ValidationIssue,
} from '../types/tournament';
import type { Sponsor } from '../types/sponsor';
import { resolveBracket } from './bracket';
import { activeSponsors } from './sponsors';
import { validateStreams } from './streams';
import { computeSchedule, findScheduleIssues } from './schedule';
import {
  computeStandings,
  computeStats,
  getChampion,
  sortByStart,
  type ChampionInfo,
  type TournamentStats,
} from './tournament-status';
import { validateConfig, validateMatches, validateTeams } from './validation';

export interface TournamentModel {
  config: TournamentConfig;
  teams: readonly TeamDefinition[];
  teamsById: ReadonlyMap<string, TeamDefinition>;
  /** Partidas resolvidas em ordem cronológica. */
  matches: readonly ResolvedMatch[];
  matchesById: ReadonlyMap<string, ResolvedMatch>;
  standings: ReadonlyMap<string, TeamStanding>;
  champion: ChampionInfo | null;
  stats: TournamentStats;
  issues: readonly ValidationIssue[];
  /** Patrocinadores ativos, já ordenados por `displayOrder`. */
  sponsors: readonly Sponsor[];
  /** Links das transmissões ao vivo, por dia (e opcionalmente por partida). */
  streams: LiveStreams;
}

/**
 * Monta o modelo único consumido por toda a interface (hero, agenda,
 * chaveamento, equipes). Nenhum componente calcula horários ou vencedores
 * por conta própria.
 */
export function buildTournament(
  config: TournamentConfig,
  teams: readonly TeamDefinition[],
  matches: readonly MatchDefinition[],
  sponsors: readonly Sponsor[] = [],
  streams: LiveStreams = { byDay: {} },
): TournamentModel {
  const configIssues = validateConfig(config);
  const scheduleUsable = !configIssues.some((i) => i.severity === 'error');
  const schedule = scheduleUsable ? computeSchedule(matches, config.schedule) : new Map();
  const bracket = resolveBracket(teams, matches, schedule);
  const ordered = sortByStart(bracket.matches);
  const standings = computeStandings(teams, ordered);

  const issues: ValidationIssue[] = [
    ...configIssues,
    ...validateTeams(teams),
    ...validateMatches(config, matches),
    ...bracket.issues,
    ...findScheduleIssues(matches, schedule),
    ...validateStreams(streams),
  ];

  return {
    config,
    teams,
    teamsById: new Map(teams.map((t) => [t.id, t])),
    matches: ordered,
    matchesById: new Map(ordered.map((m) => [m.definition.id, m])),
    standings,
    champion: getChampion(ordered),
    stats: computeStats(teams, ordered, standings),
    issues: dedupe(issues),
    sponsors: activeSponsors(sponsors),
    streams,
  };
}

function dedupe(issues: ValidationIssue[]): ValidationIssue[] {
  const seen = new Set<string>();
  return issues.filter((issue) => {
    const key = `${issue.severity}|${issue.message}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
