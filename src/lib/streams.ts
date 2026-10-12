import type { LiveStreams, ValidationIssue } from '../types/tournament';
import { isSafeUrl } from './validation';

/** URL da live da partida: `byMatch` tem prioridade sobre o link do dia. */
export function streamUrlFor(streams: LiveStreams, matchId: string, date: string): string | null {
  const raw = streams.byMatch?.[matchId] ?? streams.byDay[date] ?? '';
  const url = raw.trim();
  return url && isSafeUrl(url) ? url : null;
}

export function validateStreams(streams: LiveStreams): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const [date, url] of Object.entries(streams.byDay)) {
    if (url.trim() && !isSafeUrl(url)) {
      issues.push({ severity: 'warning', message: `Link da live de ${date} é inválido e foi ocultado.` });
    }
  }
  for (const [id, url] of Object.entries(streams.byMatch ?? {})) {
    if (url.trim() && !isSafeUrl(url)) {
      issues.push({ severity: 'warning', message: `Link da live da partida ${id} é inválido e foi ocultado.` });
    }
  }
  return issues;
}
