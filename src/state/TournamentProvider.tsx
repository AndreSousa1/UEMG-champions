import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { createClock } from '../lib/clock';
import type { TournamentModel } from '../lib/tournament';
import { SelectionContext, TournamentContext, type Selection } from './context';

interface TournamentProviderProps {
  model: TournamentModel;
  /** Fixa a hora atual (usado nos testes). */
  fixedNow?: Date;
  children: ReactNode;
}

const REFRESH_MS = 15_000;

export function TournamentProvider({ model, fixedNow, children }: TournamentProviderProps) {
  const clock = useMemo(
    () => (fixedNow ? () => fixedNow : createClock(model.config.clockOverride)),
    [fixedNow, model.config.clockOverride],
  );
  const [now, setNow] = useState(() => clock());
  const [selection, setSelection] = useState<Selection>(null);

  useEffect(() => {
    if (fixedNow) return;
    const id = window.setInterval(() => setNow(clock()), REFRESH_MS);
    return () => window.clearInterval(id);
  }, [clock, fixedNow]);

  const tournamentValue = useMemo(() => ({ model, now, clock }), [model, now, clock]);
  const selectionValue = useMemo(
    () => ({
      selection,
      openMatch: (id: string) => setSelection({ type: 'match', id }),
      openTeam: (id: string) => setSelection({ type: 'team', id }),
      close: () => setSelection(null),
    }),
    [selection],
  );

  return (
    <TournamentContext.Provider value={tournamentValue}>
      <SelectionContext.Provider value={selectionValue}>{children}</SelectionContext.Provider>
    </TournamentContext.Provider>
  );
}
