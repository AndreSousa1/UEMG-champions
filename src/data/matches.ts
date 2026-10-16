import { sourceData } from '../lib/tournament-data';
import type { MatchDefinition } from '../types/tournament';

/** Partidas vêm de src/data/tournament.json. */
export const matches: readonly MatchDefinition[] = sourceData.matches;
