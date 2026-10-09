import { createContext, useContext, useMemo } from 'react';
import type { TournamentModel } from '../lib/tournament';
import { computeCurrentStage, computePhase, getUpcoming } from '../lib/tournament-status';

export interface TournamentContextValue {
  model: TournamentModel;
  /** Hora atual (atualizada periodicamente). */
  now: Date;
  /** Leitura instantânea do relógio, para contagens regressivas. */
  clock: () => Date;
}

export const TournamentContext = createContext<TournamentContextValue | null>(null);

export function useTournament(): TournamentContextValue {
  const value = useContext(TournamentContext);
  if (!value) throw new Error('useTournament precisa estar dentro de <TournamentProvider>.');
  return value;
}

/** Situação do campeonato que depende da hora atual. */
export function useLiveStatus() {
  const { model, now } = useTournament();
  return useMemo(
    () => ({
      phase: computePhase(model.matches, now, model.config.phaseOverride),
      currentStage: computeCurrentStage(model.matches),
      ...getUpcoming(model.matches, now),
    }),
    [model, now],
  );
}

export type Selection = { type: 'match'; id: string } | { type: 'team'; id: string } | null;

export interface SelectionContextValue {
  selection: Selection;
  openMatch: (id: string) => void;
  openTeam: (id: string) => void;
  close: () => void;
}

export const SelectionContext = createContext<SelectionContextValue>({
  selection: null,
  openMatch: () => {},
  openTeam: () => {},
  close: () => {},
});

export function useSelection(): SelectionContextValue {
  return useContext(SelectionContext);
}
