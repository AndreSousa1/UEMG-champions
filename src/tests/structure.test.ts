import { describe, expect, it } from 'vitest';
import { tournamentConfig } from '../config/tournament.config';
import { matches } from '../data/matches';
import { sponsors } from '../data/sponsors';
import { liveStreams } from '../data/streams';
import { teams } from '../data/teams';
import { buildTournament } from '../lib/tournament';
import type { SlotSource } from '../types/tournament';
import { build } from './helpers';

const byId = (id: string) => {
  const match = matches.find((m) => m.id === id);
  if (!match) throw new Error(`Partida ${id} não encontrada`);
  return match;
};
const sources = (id: string): [SlotSource, SlotSource] => [byId(id).team1, byId(id).team2];

describe('estrutura inicial do campeonato', () => {
  it('tem exatamente 12 equipes, com IDs A–L', () => {
    expect(teams).toHaveLength(12);
    expect(teams.map((t) => t.id).sort()).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']);
    const names = teams.map((t) => t.name.trim().toLowerCase());
    expect(names.every((n) => n.length > 0)).toBe(true);
    expect(new Set(names).size).toBe(teams.length);
  });

  it('tem 11 partidas no total (eliminação simples com 12 equipes)', () => {
    expect(matches).toHaveLength(11);
    expect(matches).toHaveLength(teams.length - 1);
  });

  it('configura as quatro partidas preliminares em MD1', () => {
    const prelims = matches.filter((m) => m.stage === 'preliminary');
    expect(prelims.map((m) => m.id)).toEqual(['PRE-01', 'PRE-02', 'PRE-03', 'PRE-04']);
    expect(prelims.every((m) => m.format === 'MD1' && m.date in tournamentConfig.schedule.days)).toBe(true);
    expect(sources('PRE-01')).toEqual([{ team: 'A' }, { team: 'B' }]);
    expect(sources('PRE-02')).toEqual([{ team: 'C' }, { team: 'D' }]);
    expect(sources('PRE-03')).toEqual([{ team: 'E' }, { team: 'F' }]);
    expect(sources('PRE-04')).toEqual([{ team: 'G' }, { team: 'H' }]);
  });

  it('respeita o mapeamento das quartas definido pela organização', () => {
    const qfs = matches.filter((m) => m.stage === 'quarterfinal');
    expect(qfs.map((m) => m.id)).toEqual(['QF-01', 'QF-02', 'QF-03', 'QF-04']);
    expect(qfs.every((m) => m.format === 'MD1' && m.date in tournamentConfig.schedule.days)).toBe(true);
    expect(sources('QF-01')).toEqual([{ winnerOf: 'PRE-01' }, { winnerOf: 'PRE-02' }]);
    expect(sources('QF-02')).toEqual([{ winnerOf: 'PRE-03' }, { winnerOf: 'PRE-04' }]);
    expect(sources('QF-03')).toEqual([{ team: 'I' }, { team: 'J' }]);
    expect(sources('QF-04')).toEqual([{ team: 'K' }, { team: 'L' }]);
  });

  it('semifinais recebem os vencedores corretos das quartas, em MD3', () => {
    expect(sources('SF-01')).toEqual([{ winnerOf: 'QF-01' }, { winnerOf: 'QF-03' }]);
    expect(sources('SF-02')).toEqual([{ winnerOf: 'QF-02' }, { winnerOf: 'QF-04' }]);
    expect(byId('SF-01').format).toBe('MD3');
    expect(byId('SF-02').format).toBe('MD3');
  });

  it('a final recebe os vencedores das semifinais, em MD3', () => {
    expect(sources('FINAL')).toEqual([{ winnerOf: 'SF-01' }, { winnerOf: 'SF-02' }]);
    expect(byId('FINAL').format).toBe('MD3');
    expect(byId('FINAL').date).toBe('2026-10-15');
  });

  it('a chave vazia não tem inconsistências nem resultados', () => {
    const model = build();
    expect(model.issues.filter((issue) => issue.severity === 'error')).toEqual([]);
    expect(model.matches.every((m) => m.state === 'scheduled' && m.result.kind === 'none')).toBe(true);
    expect(model.champion).toBeNull();
    expect([...model.standings.values()].every((s) => s.status === 'awaiting-debut')).toBe(true);
  });

  it('os dados publicados em tournament.json montam o modelo sem erros', () => {
    const model = buildTournament(tournamentConfig, teams, matches, sponsors, liveStreams);
    expect(model.issues.filter((issue) => issue.severity === 'error')).toEqual([]);
  });

  it('as equipes I, J, K e L entram diretamente nas quartas', () => {
    const model = build();
    for (const id of ['I', 'J', 'K', 'L']) expect(model.standings.get(id)?.entryStage).toBe('quarterfinal');
    for (const id of ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']) expect(model.standings.get(id)?.entryStage).toBe('preliminary');
  });
});
