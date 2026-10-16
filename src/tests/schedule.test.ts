import { describe, expect, it } from 'vitest';
import { matches } from '../data/matches';
import { computeSchedule, findScheduleIssues } from '../lib/schedule';
import { formatTime, zonedDateTimeToInstant } from '../lib/time';
import { build, config, withResults, withSchedule } from './helpers';

const timesFor = (cfg = config, list = matches) => {
  const slots = computeSchedule(list, cfg.schedule);
  return Object.fromEntries(list.map((m) => [m.id, formatTime(slots.get(m.id)!.start, cfg.schedule.timeZone)]));
};

describe('agenda', () => {
  it('converte o horário de Brasília corretamente para UTC', () => {
    expect(zonedDateTimeToInstant('2026-10-12', '19:00', 'America/Sao_Paulo').toISOString()).toBe('2026-10-12T22:00:00.000Z');
  });

  it('gera a programação a partir do dia, da ordem e da duração de cada partida', () => {
    expect(timesFor()).toEqual({
      'PRE-01': '19:00',
      'PRE-02': '21:00',
      'PRE-03': '21:00',
      'PRE-04': '22:00',
      'QF-01': '22:00',
      'QF-02': '20:00',
      'QF-03': '20:00',
      'QF-04': '19:00',
      'SF-01': '19:00',
      'SF-02': '20:30',
      FINAL: '19:00',
    });
  });

  it('respeita as durações configuradas (MD1 = 60, MD3 = 90)', () => {
    const slots = computeSchedule(matches, config.schedule);
    for (const match of matches) {
      const slot = slots.get(match.id)!;
      const minutes = (slot.end.getTime() - slot.start.getTime()) / 60_000;
      expect(minutes).toBe(match.format === 'MD1' ? 60 : 90);
    }
  });

  it('recalcula os horários quando a duração de uma modalidade muda', () => {
    const times = timesFor(withSchedule({ durationsMinutes: { MD1: 75, MD3: 90 } }));
    expect(times['QF-03']).toBe('20:15');
    expect(times['PRE-04']).toBe('22:45');
    expect(times['SF-02']).toBe('20:30');
  });

  it('aplica o intervalo entre partidas', () => {
    const times = timesFor(withSchedule({ gapMinutes: 15 }));
    expect(times['QF-03']).toBe('20:15');
    expect(times['SF-02']).toBe('20:45');
  });

  it('usa o horário fixo de uma partida e recalcula as seguintes do mesmo dia a partir dele', () => {
    const list = withResults({ 'QF-03': { fixedTime: '20:20' } });
    const times = timesFor(config, list);
    expect(times['PRE-01']).toBe('19:00');
    expect(times['QF-03']).toBe('20:20');
    expect(times['PRE-03']).toBe('21:20');
  });

  it('recalcula quando o horário inicial do dia muda', () => {
    const cfg = withSchedule({ days: { ...config.schedule.days, '2026-10-14': { startTime: '18:00' } } });
    const times = timesFor(cfg);
    expect(times['SF-01']).toBe('18:00');
    expect(times['SF-02']).toBe('19:30');
  });

  it('não cria partidas simultâneas na configuração padrão', () => {
    const slots = computeSchedule(matches, config.schedule);
    const sorted = [...slots.values()].sort((a, b) => a.start.getTime() - b.start.getTime());
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i]!.start.getTime()).toBeGreaterThanOrEqual(sorted[i - 1]!.end.getTime());
    }
    expect(findScheduleIssues(matches, slots)).toEqual([]);
  });

  it('avisa quando um horário fixo causa partidas simultâneas', () => {
    const list = withResults({ 'PRE-02': { fixedTime: '19:30' } });
    const model = build(list);
    expect(model.issues.some((i) => i.message.includes('simultâneas'))).toBe(true);
  });
});
