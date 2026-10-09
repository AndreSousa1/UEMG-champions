import type {
  ResolvedMatch,
  StageId,
  TeamDefinition,
  TeamStanding,
  TournamentPhase,
} from '../types/tournament';
import { findFinalMatch, STAGE_ORDER, stageIndex } from './bracket';

export function matchStart(match: ResolvedMatch): number {
  return match.schedule?.start.getTime() ?? Number.POSITIVE_INFINITY;
}

export function sortByStart(matches: readonly ResolvedMatch[]): ResolvedMatch[] {
  return [...matches].sort(
    (a, b) =>
      matchStart(a) - matchStart(b) ||
      stageIndex(a.definition.stage) - stageIndex(b.definition.stage) ||
      a.definition.order - b.definition.order,
  );
}

function teamInMatch(match: ResolvedMatch, teamId: string): boolean {
  return match.slots.some((s) => s.kind === 'team' && s.teamId === teamId);
}

/** Faixa de colocação de quem perde na etapa informada (ex.: semifinal -> "3º–4º"). */
export function placementForElimination(matches: readonly ResolvedMatch[], stage: StageId): string {
  const later = matches.filter((m) => stageIndex(m.definition.stage) > stageIndex(stage)).length;
  const inStage = matches.filter((m) => m.definition.stage === stage).length;
  const first = later + 2;
  const last = first + inStage - 1;
  return first === last ? `${first}º lugar` : `${first}º–${last}º lugar`;
}

export interface ChampionInfo {
  championId: string;
  runnerUpId: string;
  finalMatch: ResolvedMatch;
}

/** Só existe campeão quando a final está encerrada com resultado válido. */
export function getChampion(matches: readonly ResolvedMatch[]): ChampionInfo | null {
  const final = findFinalMatch(matches);
  if (!final || final.state !== 'completed' || !final.winnerTeamId || !final.loserTeamId) return null;
  return { championId: final.winnerTeamId, runnerUpId: final.loserTeamId, finalMatch: final };
}

/** Situação de cada equipe, derivada apenas de resultados válidos. */
export function computeStandings(
  teams: readonly TeamDefinition[],
  matches: readonly ResolvedMatch[],
): Map<string, TeamStanding> {
  const standings = new Map<string, TeamStanding>();
  const final = findFinalMatch(matches);
  const ordered = [...matches].sort((a, b) => stageIndex(a.definition.stage) - stageIndex(b.definition.stage));

  for (const team of teams) {
    const appearances = ordered.filter((m) => teamInMatch(m, team.id));
    const completed = appearances.filter((m) => m.state === 'completed');
    const wins = completed.filter((m) => m.winnerTeamId === team.id).length;
    const loss = completed.find((m) => m.loserTeamId === team.id) ?? null;
    const pending = appearances.find((m) => m.state !== 'completed') ?? null;
    const entryMatch =
      ordered.find((m) => m.slots.some((s) => s.kind !== 'invalid' && 'team' in s.source && s.source.team === team.id)) ?? null;

    const base = {
      teamId: team.id,
      wins,
      entryStage: entryMatch?.definition.stage ?? null,
      nextMatchId: null as string | null,
      lastCompletedMatchId: completed.at(-1)?.definition.id ?? null,
      eliminatedIn: null as StageId | null,
      placement: null as string | null,
    };

    if (loss) {
      const isFinal = final !== null && loss.definition.id === final.definition.id;
      standings.set(team.id, {
        ...base,
        status: isFinal ? 'runner-up' : 'eliminated',
        label: isFinal ? 'Vice-campeã' : 'Eliminada',
        eliminatedIn: loss.definition.stage,
        placement: isFinal ? '2º lugar' : placementForElimination(matches, loss.definition.stage),
      });
      continue;
    }

    if (final && final.state === 'completed' && final.winnerTeamId === team.id) {
      standings.set(team.id, { ...base, status: 'champion', label: 'Campeã', placement: '1º lugar' });
      continue;
    }

    const nextMatchId = pending?.definition.id ?? null;

    if (wins === 0) {
      standings.set(team.id, { ...base, nextMatchId, status: 'awaiting-debut', label: 'Aguardando estreia' });
      continue;
    }

    const stage = pending?.definition.stage ?? null;
    if (stage === 'final') {
      standings.set(team.id, { ...base, nextMatchId, status: 'finalist', label: 'Finalista' });
    } else if (stage === 'semifinal') {
      standings.set(team.id, { ...base, nextMatchId, status: 'semifinalist', label: 'Semifinalista' });
    } else {
      standings.set(team.id, { ...base, nextMatchId, status: 'qualified', label: 'Classificada' });
    }
  }

  return standings;
}

/** Situação geral do campeonato. */
export function computePhase(
  matches: readonly ResolvedMatch[],
  now: Date,
  override: TournamentPhase | null,
): TournamentPhase {
  if (override) return override;
  if (getChampion(matches)) return 'completed';
  const started =
    matches.some((m) => m.state === 'completed' || m.state === 'live') ||
    matches.some((m) => m.schedule !== null && m.schedule.start.getTime() <= now.getTime());
  return started ? 'in-progress' : 'not-started';
}

/** Primeira etapa que ainda tem partidas não encerradas. */
export function computeCurrentStage(matches: readonly ResolvedMatch[]): StageId | null {
  for (const stage of STAGE_ORDER) {
    const inStage = matches.filter((m) => m.definition.stage === stage);
    if (inStage.length > 0 && inStage.some((m) => m.state !== 'completed')) return stage;
  }
  return null;
}

export function stagesInUse(matches: readonly ResolvedMatch[]): StageId[] {
  return STAGE_ORDER.filter((stage) => matches.some((m) => m.definition.stage === stage));
}

/**
 * Partidas ao vivo (status explícito) e a próxima partida agendada.
 * Se o horário previsto já passou e não há resultado, a partida é tratada
 * como "aguardando resultado" e não como ao vivo.
 */
export function getUpcoming(matches: readonly ResolvedMatch[], now: Date) {
  const ordered = sortByStart(matches);
  const live = ordered.filter((m) => m.state === 'live');
  const notDone = ordered.filter((m) => m.state !== 'completed' && m.state !== 'live');
  const next = notDone.find((m) => matchStart(m) > now.getTime()) ?? null;
  const awaitingResult = notDone.filter((m) => matchStart(m) <= now.getTime());
  return { live, next, awaitingResult };
}

export interface TournamentStats {
  totalTeams: number;
  totalMatches: number;
  completedMatches: number;
  advancedTeams: number;
  eliminatedTeams: number;
}

export function computeStats(
  teams: readonly TeamDefinition[],
  matches: readonly ResolvedMatch[],
  standings: ReadonlyMap<string, TeamStanding>,
): TournamentStats {
  const all = [...standings.values()];
  return {
    totalTeams: teams.length,
    totalMatches: matches.length,
    completedMatches: matches.filter((m) => m.state === 'completed').length,
    advancedTeams: all.filter((s) => s.wins > 0).length,
    eliminatedTeams: all.filter((s) => s.status === 'eliminated' || s.status === 'runner-up').length,
  };
}
