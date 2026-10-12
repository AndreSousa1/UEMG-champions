import type { LiveStreams } from '../types/tournament';

/**
 * TRANSMISSÕES AO VIVO
 *
 * Um link por dia do campeonato. O botão "Acompanhe a live" no card da
 * próxima partida e nos detalhes de cada jogo usa o link do dia da partida.
 *
 * Para trocar a live de um dia, altere só a URL desse dia. Para um jogo
 * específico (ex.: a final em outro canal), use `byMatch`:
 *   byMatch: { FINAL: 'https://www.youtube.com/watch?v=...' }
 *
 * Deixe a string vazia para esconder o botão naquele dia. Use apenas https://.
 */
export const liveStreams = {
  byDay: {
    '2026-10-12': 'https://www.youtube.com/watch?v=Cxy2-GkWYqA',
    '2026-10-13': 'https://www.youtube.com/watch?v=Cxy2-GkWYqA',
    '2026-10-14': 'https://www.youtube.com/watch?v=Cxy2-GkWYqA',
    '2026-10-15': 'https://www.youtube.com/watch?v=Cxy2-GkWYqA',
  },
} as const satisfies LiveStreams;
