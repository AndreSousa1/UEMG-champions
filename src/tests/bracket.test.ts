import { describe, expect, it } from 'vitest';
import { evaluateResult } from '../lib/results';
import { computePhase } from '../lib/tournament-status';
import type { ResolvedMatch } from '../types/tournament';
import { build, md1Win, md3Win, withResults } from './helpers';

const teamIn = (match: ResolvedMatch | undefined, slot: 0 | 1) => {
  const s = match?.slots[slot];
  return s?.kind === 'team' ? s.teamId : s?.kind;
};

describe('resultados e progressão automática', () => {
  it('um resultado MD1 classifica o vencedor e elimina o perdedor', () => {
    const model = build(withResults({ 'PRE-01': md1Win(2) }));
    const pre01 = model.matchesById.get('PRE-01')!;
    expect(pre01.state).toBe('completed');
    expect(pre01.winnerTeamId).toBe('B');
    expect(pre01.loserTeamId).toBe('A');
    expect(model.standings.get('B')?.status).toBe('qualified');
    expect(model.standings.get('A')?.status).toBe('eliminated');
    expect(model.standings.get('A')?.placement).toBe('9º–12º lugar');
    expect(teamIn(model.matchesById.get('QF-01'), 0)).toBe('B');
    expect(teamIn(model.matchesById.get('QF-01'), 1)).toBe('pending');
  });

  it('não classifica ninguém enquanto a partida não está encerrada', () => {
    const model = build(withResults({ 'PRE-01': { status: 'scheduled', maps: [] } }));
    expect(teamIn(model.matchesById.get('QF-01'), 0)).toBe('pending');
    expect(model.standings.get('A')?.status).toBe('awaiting-debut');
  });

  it('não aceita um resultado MD1 com mapa sem vencedor ou com dois mapas', () => {
    expect(evaluateResult({ format: 'MD1', maps: [{ rounds: [12, 12] }] }).kind).toBe('invalid');
    expect(evaluateResult({ format: 'MD1', maps: [{ rounds: [13, 5] }, { rounds: [5, 13] }] }).kind).toBe('invalid');
    expect(evaluateResult({ format: 'MD1', maps: [{ rounds: [13, 5], winner: 2 }] }).kind).toBe('invalid');

    const model = build(withResults({ 'PRE-01': { status: 'completed', maps: [{ rounds: [12, 12] }] } }));
    expect(model.matchesById.get('PRE-01')?.state).toBe('invalid');
    expect(model.matchesById.get('PRE-01')?.winnerTeamId).toBeNull();
    expect(teamIn(model.matchesById.get('QF-01'), 0)).toBe('pending');
  });

  it('uma MD3 não pode ser encerrada antes de uma equipe alcançar duas vitórias', () => {
    const oneMap = evaluateResult({ format: 'MD3', maps: [{ rounds: [13, 4] }] });
    expect(oneMap.kind).toBe('partial');
    const split = evaluateResult({ format: 'MD3', maps: [{ rounds: [13, 4] }, { rounds: [4, 13] }] });
    expect(split.kind).toBe('partial');
    const decided = evaluateResult({ format: 'MD3', maps: [{ rounds: [13, 4] }, { rounds: [13, 11] }] });
    expect(decided).toMatchObject({ kind: 'decided', winner: 1, mapWins: [2, 0] });
    const extraMap = evaluateResult({ format: 'MD3', maps: [{ rounds: [13, 4] }, { rounds: [13, 11] }, { rounds: [5, 13] }] });
    expect(extraMap.kind).toBe('invalid');

    const results = withResults({
      'PRE-01': md1Win(1),
      'PRE-02': md1Win(1),
      'QF-01': md1Win(1),
      'QF-03': md1Win(1),
      'SF-01': { status: 'completed', maps: [{ rounds: [13, 4] }, { rounds: [4, 13] }] },
    });
    const model = build(results);
    const sf = model.matchesById.get('SF-01')!;
    expect(sf.state).toBe('invalid');
    expect(sf.winnerTeamId).toBeNull();
    expect(teamIn(model.matchesById.get('FINAL'), 0)).toBe('pending');
  });

  it('preenche semifinais, final e campeão a partir dos resultados', () => {
    const results = withResults({
      'PRE-01': md1Win(1), // A
      'PRE-02': md1Win(2), // D
      'PRE-03': md1Win(1), // E
      'PRE-04': md1Win(2), // H
      'QF-01': md1Win(2), // D
      'QF-02': md1Win(1), // E
      'QF-03': md1Win(1), // I
      'QF-04': md1Win(2), // L
      'SF-01': md3Win(1), // D
      'SF-02': md3Win(2), // L
    });
    let model = build(results);
    expect([teamIn(model.matchesById.get('QF-01'), 0), teamIn(model.matchesById.get('QF-01'), 1)]).toEqual(['A', 'D']);
    expect([teamIn(model.matchesById.get('SF-01'), 0), teamIn(model.matchesById.get('SF-01'), 1)]).toEqual(['D', 'I']);
    expect([teamIn(model.matchesById.get('SF-02'), 0), teamIn(model.matchesById.get('SF-02'), 1)]).toEqual(['E', 'L']);
    expect([teamIn(model.matchesById.get('FINAL'), 0), teamIn(model.matchesById.get('FINAL'), 1)]).toEqual(['D', 'L']);
    expect(model.standings.get('D')?.status).toBe('finalist');
    expect(model.standings.get('I')?.placement).toBe('3º–4º lugar');
    expect(model.standings.get('A')?.placement).toBe('5º–8º lugar');
    expect(model.champion).toBeNull();

    model = build(withResults({ FINAL: md3Win(2) }, results));
    expect(model.champion?.championId).toBe('L');
    expect(model.champion?.runnerUpId).toBe('D');
    expect(model.standings.get('L')?.status).toBe('champion');
    expect(model.standings.get('D')?.status).toBe('runner-up');
    expect(computePhase(model.matches, new Date('2026-10-16T00:00:00Z'), null)).toBe('completed');
    expect(model.issues).toEqual([]);
  });

  it('marca a partida como inválida se for encerrada antes de os participantes existirem', () => {
    const model = build(withResults({ 'QF-01': md1Win(1) }));
    const qf = model.matchesById.get('QF-01')!;
    expect(qf.state).toBe('invalid');
    expect(qf.winnerTeamId).toBeNull();
    expect(teamIn(model.matchesById.get('SF-01'), 0)).toBe('pending');
  });

  it('aceita W.O. sem mapas', () => {
    const model = build(withResults({ 'PRE-02': { status: 'completed', walkover: 2, maps: [] } }));
    expect(model.matchesById.get('PRE-02')?.winnerTeamId).toBe('D');
  });
});

describe('regras de consistência do chaveamento', () => {
  it('não permite que uma equipe ocupe duas vagas', () => {
    const model = build(withResults({ 'PRE-02': { team1: { team: 'A' } } }));
    expect(model.issues.some((i) => i.severity === 'error' && i.message.includes('Equipe A'))).toBe(true);
    expect(model.matchesById.get('PRE-01')?.slots[0].kind).toBe('invalid');
    expect(model.matchesById.get('PRE-02')?.slots[0].kind).toBe('invalid');
  });

  it('não permite que o vencedor de uma partida ocupe duas vagas', () => {
    const results = withResults({ 'PRE-01': md1Win(1), 'QF-02': { team1: { winnerOf: 'PRE-01' } } });
    const model = build(results);
    expect(model.matchesById.get('QF-01')?.slots[0].kind).toBe('invalid');
    expect(model.matchesById.get('QF-02')?.slots[0].kind).toBe('invalid');
    expect(model.standings.get('A')?.nextMatchId).toBeNull();
  });

  it('recusa referências a partidas inexistentes ou de etapas posteriores', () => {
    const model = build(withResults({ 'QF-01': { team1: { winnerOf: 'PRE-99' } }, 'QF-02': { team1: { winnerOf: 'SF-01' } } }));
    expect(model.matchesById.get('QF-01')?.slots[0]).toMatchObject({ kind: 'invalid' });
    expect(model.matchesById.get('QF-02')?.slots[0]).toMatchObject({ kind: 'invalid' });
    expect(model.issues.filter((i) => i.severity === 'error').length).toBeGreaterThan(0);
  });
});
