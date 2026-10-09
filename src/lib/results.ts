import type { EvaluatedMap, MatchDefinition, ResultEvaluation, SeriesFormat } from '../types/tournament';

export function mapsToWin(format: SeriesFormat): number {
  return format === 'MD1' ? 1 : 2;
}

export function maxMaps(format: SeriesFormat): number {
  return format === 'MD1' ? 1 : 3;
}

function isRoundCount(value: number): boolean {
  return Number.isInteger(value) && value >= 0;
}

/**
 * Avalia os mapas cadastrados de uma partida, sem considerar o status.
 * Nunca "adivinha" um vencedor: qualquer inconsistência resulta em `invalid`.
 */
export function evaluateResult(match: Pick<MatchDefinition, 'format' | 'maps' | 'walkover'>): ResultEvaluation {
  const maps = match.maps ?? [];

  if (match.walkover !== undefined) {
    if (match.walkover !== 1 && match.walkover !== 2) {
      return { kind: 'invalid', reason: 'W.O. deve indicar a equipe 1 ou 2.' };
    }
    if (maps.length > 0) {
      return { kind: 'invalid', reason: 'Partida com W.O. não deve ter mapas cadastrados.' };
    }
    const needed = mapsToWin(match.format);
    const mapWins: [number, number] = match.walkover === 1 ? [needed, 0] : [0, needed];
    return { kind: 'decided', winner: match.walkover, mapWins, maps: [], walkover: true };
  }

  if (maps.length === 0) return { kind: 'none' };

  const needed = mapsToWin(match.format);
  const mapWins: [number, number] = [0, 0];
  const evaluated: EvaluatedMap[] = [];

  for (let index = 0; index < maps.length; index++) {
    const map = maps[index]!;
    const label = `Mapa ${index + 1}`;

    if (mapWins[0] >= needed || mapWins[1] >= needed) {
      return {
        kind: 'invalid',
        reason: `${label} cadastrado depois de a série ${match.format} já estar decidida.`,
      };
    }

    let roundsWinner: 1 | 2 | null = null;
    if (map.rounds) {
      const [a, b] = map.rounds;
      if (!isRoundCount(a) || !isRoundCount(b)) {
        return { kind: 'invalid', reason: `${label}: rounds devem ser números inteiros não negativos.` };
      }
      if (a === b) {
        return { kind: 'invalid', reason: `${label}: placar empatado (${a}–${b}) não define vencedor.` };
      }
      roundsWinner = a > b ? 1 : 2;
    }

    if (map.winner !== undefined && map.winner !== 1 && map.winner !== 2) {
      return { kind: 'invalid', reason: `${label}: vencedor deve ser 1 ou 2.` };
    }
    if (map.winner !== undefined && roundsWinner !== null && map.winner !== roundsWinner) {
      return { kind: 'invalid', reason: `${label}: vencedor informado não corresponde ao placar de rounds.` };
    }

    const winner = map.winner ?? roundsWinner;
    if (winner === null) {
      return { kind: 'invalid', reason: `${label}: informe os rounds ou o vencedor.` };
    }

    mapWins[winner - 1]! += 1;
    evaluated.push({
      index,
      map: map.map?.trim() ? map.map.trim() : null,
      rounds: map.rounds ?? null,
      winner,
    });
  }

  if (mapWins[0] >= needed) return { kind: 'decided', winner: 1, mapWins, maps: evaluated, walkover: false };
  if (mapWins[1] >= needed) return { kind: 'decided', winner: 2, mapWins, maps: evaluated, walkover: false };
  return { kind: 'partial', mapWins, maps: evaluated };
}
