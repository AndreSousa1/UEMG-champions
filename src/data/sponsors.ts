import { sourceData } from '../lib/tournament-data';
import type { Sponsor } from '../types/sponsor';

/** Patrocinadores vêm de src/data/tournament.json. */
export const sponsors: readonly Sponsor[] = sourceData.sponsors;
