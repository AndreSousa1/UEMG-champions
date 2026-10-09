import { PHASE_LABEL } from '../../lib/display';
import type { TournamentPhase } from '../../types/tournament';

const STYLES: Record<TournamentPhase, { box: string; dot: string }> = {
  'not-started': { box: 'border-line-strong text-fg-muted', dot: 'bg-fg-muted' },
  'in-progress': { box: 'border-accent/40 bg-accent/[0.08] text-accent', dot: 'bg-accent animate-pulse-dot' },
  completed: { box: 'border-gold/40 bg-gold/10 text-gold', dot: 'bg-gold' },
};

export function PhaseBadge({ phase }: { phase: TournamentPhase }) {
  const style = STYLES[phase];
  return (
    <span className={`chip px-2.5 py-1 ${style.box}`}>
      <span className={`size-1.5 rounded-full ${style.dot}`} aria-hidden="true" />
      <span className="sr-only">Situação do campeonato: </span>
      {PHASE_LABEL[phase]}
    </span>
  );
}
