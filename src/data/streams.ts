import { sourceData } from '../lib/tournament-data';
import type { LiveStreams } from '../types/tournament';

/** Transmissões vêm de src/data/tournament.json. */
export const liveStreams: LiveStreams = sourceData.streams;
