import { tournamentConfig } from '../config/tournament.config';
import { matches } from '../data/matches';
import { teams } from '../data/teams';
import { buildTournament } from '../lib/tournament';
import type { MapResult, MatchDefinition, TournamentConfig } from '../types/tournament';

export const config: TournamentConfig = tournamentConfig;

type ResultPatch = Partial<Pick<MatchDefinition, 'status' | 'maps' | 'walkover' | 'fixedTime' | 'team1' | 'team2' | 'stage' | 'date' | 'order'>>;

export function withResults(patches: Record<string, ResultPatch>, base: readonly MatchDefinition[] = matches): MatchDefinition[] {
  return base.map((m) => (patches[m.id] ? { ...m, ...patches[m.id] } : m));
}

/** Vitória da equipe 1 (slot = 1) ou 2 em uma MD1. */
export function md1Win(slot: 1 | 2): ResultPatch {
  const rounds: readonly [number, number] = slot === 1 ? [13, 8] : [9, 13];
  return { status: 'completed', maps: [{ map: 'Mirage', rounds }] };
}

/** Vitória 2–1 da equipe informada em uma MD3. */
export function md3Win(slot: 1 | 2): ResultPatch {
  const w = (s: 1 | 2): MapResult => ({ rounds: s === 1 ? [13, 10] : [10, 13] });
  const other = slot === 1 ? 2 : 1;
  return { status: 'completed', maps: [w(slot), w(other), w(slot)] };
}

export function build(matchList: readonly MatchDefinition[] = matches, cfg: TournamentConfig = config) {
  return buildTournament(cfg, teams, matchList);
}

export function withSchedule(patch: Partial<TournamentConfig['schedule']>): TournamentConfig {
  return { ...config, schedule: { ...config.schedule, ...patch } };
}
