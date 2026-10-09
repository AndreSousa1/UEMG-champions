import type { MatchDefinition, ScheduleConfig, ScheduledSlot, ValidationIssue } from '../types/tournament';
import { addMinutes, zonedDateTimeToInstant } from './time';

export function durationFor(match: Pick<MatchDefinition, 'format'>, schedule: ScheduleConfig): number {
  return schedule.durationsMinutes[match.format];
}

/**
 * Calcula início e fim previstos de cada partida.
 *
 * Em cada dia, as partidas são ordenadas por `order`. A primeira começa no
 * `startTime` do dia; cada seguinte começa no fim previsto da anterior somado ao
 * intervalo. Uma partida com `fixedTime` usa esse horário e passa a ser a
 * referência para as próximas do mesmo dia.
 */
export function computeSchedule(
  matches: readonly MatchDefinition[],
  schedule: ScheduleConfig,
): Map<string, ScheduledSlot> {
  const result = new Map<string, ScheduledSlot>();
  const byDay = new Map<string, MatchDefinition[]>();

  for (const match of matches) {
    const list = byDay.get(match.date) ?? [];
    list.push(match);
    byDay.set(match.date, list);
  }

  for (const [date, dayMatches] of byDay) {
    const dayConfig = schedule.days[date];
    if (!dayConfig) continue;

    const ordered = [...dayMatches].sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
    let cursor = zonedDateTimeToInstant(date, dayConfig.startTime, schedule.timeZone);

    for (const match of ordered) {
      const start = match.fixedTime
        ? zonedDateTimeToInstant(date, match.fixedTime, schedule.timeZone)
        : cursor;
      const durationMinutes = durationFor(match, schedule);
      const end = addMinutes(start, durationMinutes);
      result.set(match.id, {
        matchId: match.id,
        date,
        start,
        end,
        durationMinutes,
        isFixedTime: Boolean(match.fixedTime),
      });
      cursor = addMinutes(end, schedule.gapMinutes);
    }
  }

  return result;
}

/** Aponta partidas com horários sobrepostos e dependências fora de ordem. */
export function findScheduleIssues(
  matches: readonly MatchDefinition[],
  slots: ReadonlyMap<string, ScheduledSlot>,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const scheduled = matches
    .map((m) => slots.get(m.id))
    .filter((s): s is ScheduledSlot => Boolean(s))
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  for (let i = 0; i < scheduled.length; i++) {
    const current = scheduled[i]!;
    for (let j = i + 1; j < scheduled.length; j++) {
      const next = scheduled[j]!;
      if (next.start.getTime() >= current.end.getTime()) break;
      issues.push({
        severity: 'warning',
        matchId: next.matchId,
        message: `${next.matchId} começa antes do fim previsto de ${current.matchId} (partidas simultâneas).`,
      });
    }
  }

  for (const match of matches) {
    const slot = slots.get(match.id);
    if (!slot) continue;
    for (const source of [match.team1, match.team2]) {
      if (!('winnerOf' in source)) continue;
      const sourceSlot = slots.get(source.winnerOf);
      if (sourceSlot && slot.start.getTime() < sourceSlot.end.getTime()) {
        issues.push({
          severity: 'warning',
          matchId: match.id,
          message: `${match.id} está agendada antes do fim previsto de ${source.winnerOf}, da qual depende.`,
        });
      }
    }
  }

  return issues;
}
