import type { ScheduleDate } from '../config/tournament.config';
import { defineMatches } from '../lib/define';
import type { TeamId } from './teams';

/**
 * PARTIDAS, CHAVEAMENTO E RESULTADOS
 *
 * Participantes:
 *   { team: 'A' }           -> equipe fixa (ID de src/data/teams.ts)
 *   { winnerOf: 'PRE-01' }  -> vencedor de outra partida (preenchido automaticamente)
 *
 * Programação:
 *   date      -> dia (precisa existir em tournament.config.ts > schedule.days)
 *   order     -> ordem no dia; o horário é calculado pela agenda
 *   fixedTime -> opcional, ex.: '20:15', substitui o horário calculado
 *
 * Resultados:
 *   status: 'scheduled' (agendada) | 'live' (ao vivo) | 'completed' (encerrada) | 'postponed' (adiada)
 *   maps:   [{ map: 'Mirage', rounds: [13, 9] }]  -> rounds [equipe 1, equipe 2]
 *   O vencedor só avança quando status = 'completed' E o resultado é válido:
 *     MD1 -> exatamente um mapa; MD3 -> uma equipe com 2 mapas.
 *   walkover: 1 | 2 -> vitória por W.O. (deixe `maps` vazio)
 *
 * ESTRUTURA DAS QUARTAS DEFINIDA PELA ORGANIZAÇÃO:
 *   QF-01: vencedor PRE-01 x vencedor PRE-02
 *   QF-02: vencedor PRE-03 x vencedor PRE-04
 *   QF-03: Equipe I x Equipe J
 *   QF-04: Equipe K x Equipe L
 * Alternativa equilibrada (veja o README): PRE-01 x I, PRE-02 x J, PRE-03 x K, PRE-04 x L.
 * Use apenas UMA das estruturas.
 */
export const matches = defineMatches<TeamId, ScheduleDate>()([
  // 12/10 — Fase preliminar (MD1)
  { id: 'PRE-01', stage: 'preliminary', format: 'MD1', date: '2026-10-12', order: 1, team1: { team: 'A' }, team2: { team: 'B' }, status: 'scheduled', maps: [] },
  { id: 'PRE-02', stage: 'preliminary', format: 'MD1', date: '2026-10-13', order: 3, team1: { team: 'C' }, team2: { team: 'D' }, status: 'scheduled', maps: [] },
  { id: 'PRE-03', stage: 'preliminary', format: 'MD1', date: '2026-10-12', order: 3, team1: { team: 'E' }, team2: { team: 'F' }, status: 'scheduled', maps: [] },
  { id: 'PRE-04', stage: 'preliminary', format: 'MD1', date: '2026-10-12', order: 4, team1: { team: 'G' }, team2: { team: 'H' }, status: 'scheduled', maps: [] },

  // 13/10 — Quartas de final (MD1)
  { id: 'QF-01', stage: 'quarterfinal', format: 'MD1', date: '2026-10-13', order: 4, team1: { winnerOf: 'PRE-01' }, team2: { winnerOf: 'PRE-02' }, status: 'scheduled', maps: [] },
  { id: 'QF-02', stage: 'quarterfinal', format: 'MD1', date: '2026-10-13', order: 3, team1: { winnerOf: 'PRE-03' }, team2: { winnerOf: 'PRE-04' }, status: 'scheduled', maps: [] },
  { id: 'QF-03', stage: 'quarterfinal', format: 'MD1', date: '2026-10-12', order: 2, team1: { team: 'I' }, team2: { team: 'J' }, status: 'scheduled', maps: [] },
  { id: 'QF-04', stage: 'quarterfinal', format: 'MD1', date: '2026-10-13', order: 1, team1: { team: 'K' }, team2: { team: 'L' }, status: 'scheduled', maps: [] },

  // 14/10 — Semifinais (MD3)
  { id: 'SF-01', stage: 'semifinal', format: 'MD3', date: '2026-10-14', order: 1, team1: { winnerOf: 'QF-01' }, team2: { winnerOf: 'QF-03' }, status: 'scheduled', maps: [] },
  { id: 'SF-02', stage: 'semifinal', format: 'MD3', date: '2026-10-14', order: 2, team1: { winnerOf: 'QF-02' }, team2: { winnerOf: 'QF-04' }, status: 'scheduled', maps: [] },

  // 15/10 — Final (MD3)
  { id: 'FINAL', stage: 'final', format: 'MD3', date: '2026-10-15', order: 1, team1: { winnerOf: 'SF-01' }, team2: { winnerOf: 'SF-02' }, status: 'scheduled', maps: [] },
]);
