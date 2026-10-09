import type { MatchDefinition, SlotSource } from '../types/tournament';

type MatchInput<MId extends string, TId extends string, D extends string> = Omit<
  MatchDefinition<MId, TId, D>,
  'team1' | 'team2'
> & {
  team1: SlotSource<NoInfer<MId>, TId>;
  team2: SlotSource<NoInfer<MId>, TId>;
};

/**
 * Declara a lista de partidas com verificação de tipos:
 * `winnerOf` só aceita IDs de partidas existentes, `team` só aceita IDs de equipes
 * existentes e `date` só aceita dias configurados na agenda.
 */
export function defineMatches<TId extends string, D extends string>() {
  return <const MId extends string>(
    matches: readonly MatchInput<MId, TId, D>[],
  ): readonly MatchDefinition[] => matches;
}
