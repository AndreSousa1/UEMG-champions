import { slotView } from '../../lib/display';
import { useTournament } from '../../state/context';
import type { ResolvedSlot } from '../../types/tournament';
import { EmptyAvatar, TeamAvatar } from '../teams/TeamAvatar';

interface SlotLabelProps {
  slot: ResolvedSlot;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  align?: 'left' | 'right';
  dimmed?: boolean;
  emphasis?: boolean;
  nameClassName?: string;
}

/** Avatar + nome de uma vaga; mostra "A definir" com a origem quando a vaga ainda não tem equipe. */
export function SlotLabel({ slot, size = 'sm', align = 'left', dimmed = false, emphasis = false, nameClassName = '' }: SlotLabelProps) {
  const { model } = useTournament();
  const view = slotView(slot, model.teamsById);
  const reverse = align === 'right' ? 'flex-row-reverse text-right' : '';

  if (view.kind === 'team') {
    return (
      <span className={`flex min-w-0 items-center gap-2.5 ${reverse}`}>
        <TeamAvatar team={view.team} size={size} dimmed={dimmed} />
        <span
          className={`truncate ${emphasis ? 'font-semibold text-fg' : dimmed ? 'text-fg-dim' : 'text-fg'} ${nameClassName}`}
          title={view.team.name}
        >
          {view.team.name}
        </span>
      </span>
    );
  }

  return (
    <span className={`flex min-w-0 items-center gap-2.5 ${reverse}`}>
      <EmptyAvatar size={size} />
      <span className="min-w-0">
        <span className={`block truncate pr-1 italic ${view.kind === 'invalid' ? 'text-warn' : 'text-fg-muted'} ${nameClassName}`}>
          {view.label}
        </span>
        <span className="block truncate text-[0.7rem] text-fg-dim" title={view.hint}>
          {view.hint}
        </span>
      </span>
    </span>
  );
}
