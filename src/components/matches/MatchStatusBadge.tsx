import { MATCH_STATE_LABEL } from '../../lib/display';
import type { MatchState } from '../../types/tournament';

const STYLES: Record<MatchState, string> = {
  scheduled: 'text-fg-muted border-line',
  live: 'text-live border-live/40 bg-live/10',
  completed: 'text-fg-dim border-line',
  postponed: 'text-warn border-warn/40 bg-warn/10',
  invalid: 'text-warn border-warn/40 bg-warn/10',
};

export function MatchStatusBadge({ state, className = '' }: { state: MatchState; className?: string }) {
  return (
    <span className={`chip ${STYLES[state]} ${className}`}>
      {state === 'live' && <span className="size-1.5 animate-pulse-dot rounded-full bg-live" aria-hidden="true" />}
      {MATCH_STATE_LABEL[state]}
    </span>
  );
}
