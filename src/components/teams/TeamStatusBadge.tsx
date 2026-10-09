import { Crown } from 'lucide-react';
import { TEAM_STATUS_TONE } from '../../lib/display';
import type { TeamStanding } from '../../types/tournament';

const TONES = {
  neutral: 'text-fg-muted border-line-strong',
  accent: 'text-accent border-accent/35 bg-accent/[0.07]',
  gold: 'text-gold border-gold/40 bg-gold/10',
  muted: 'text-fg-dim border-line',
} as const;

export function TeamStatusBadge({ standing }: { standing: TeamStanding }) {
  const tone = TEAM_STATUS_TONE[standing.status];
  return (
    <span className={`chip ${TONES[tone]}`}>
      {standing.status === 'champion' && <Crown className="size-3" aria-hidden="true" />}
      {standing.label}
    </span>
  );
}
