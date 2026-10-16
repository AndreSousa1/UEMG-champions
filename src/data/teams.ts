import { sourceData } from '../lib/tournament-data';
import type { TeamDefinition } from '../types/tournament';

/** Equipes vêm de src/data/tournament.json. */
export const teams: readonly TeamDefinition[] = sourceData.teams;
export type TeamId = (typeof teams)[number]['id'];
