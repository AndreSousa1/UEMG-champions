import type { Sponsor } from '../types/sponsor';
import type { LiveStreams, MatchDefinition, TeamDefinition } from '../types/tournament';
import source from '../data/tournament.json' with { type: 'json' };

export interface TournamentData {
  teams: TeamDefinition[];
  matches: MatchDefinition[];
  sponsors: Sponsor[];
  streams: LiveStreams;
}

export const STORAGE_KEY = 'uemg-champions-data';

export const sourceData = source as unknown as TournamentData;

export function cloneData(data: TournamentData): TournamentData {
  return JSON.parse(JSON.stringify(data)) as TournamentData;
}

export function loadTournamentData(base: TournamentData = sourceData): TournamentData {
  if (typeof localStorage === 'undefined') return cloneData(base);
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneData(base);
    const parsed = JSON.parse(raw) as TournamentData;
    if (!Array.isArray(parsed.teams) || !Array.isArray(parsed.matches) || !Array.isArray(parsed.sponsors)) {
      return cloneData(base);
    }
    return cloneData({
      teams: parsed.teams,
      matches: parsed.matches,
      sponsors: parsed.sponsors,
      streams: parsed.streams ?? { byDay: {} },
    });
  } catch {
    return cloneData(base);
  }
}

export function saveTournamentData(data: TournamentData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function clearTournamentData(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function downloadTournamentData(data: TournamentData): void {
  const blob = new Blob([`${JSON.stringify(data, null, 2)}\n`], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'tournament.json';
  link.click();
  URL.revokeObjectURL(url);
}
