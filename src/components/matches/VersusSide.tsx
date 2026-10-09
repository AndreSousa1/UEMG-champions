import { slotView } from '../../lib/display';
import { useTournament } from '../../state/context';
import type { ResolvedSlot } from '../../types/tournament';
import { EmptyAvatar, TeamAvatar } from '../teams/TeamAvatar';

interface VersusSideProps {
  slot: ResolvedSlot;
  outcome?: 'winner' | 'loser' | 'none';
  onSelectTeam?: (teamId: string) => void;
}

/** Um lado do confronto em destaque: avatar acima e nome abaixo (não corta nomes longos). */
export function VersusSide({ slot, outcome = 'none', onSelectTeam }: VersusSideProps) {
  const { model } = useTournament();
  const view = slotView(slot, model.teamsById);

  if (view.kind !== 'team') {
    return (
      <div className="flex min-w-0 flex-col items-center gap-2.5 text-center">
        <EmptyAvatar size="lg" />
        <span className="leading-tight">
          <span className={`block font-display text-lg font-bold uppercase italic ${view.kind === 'invalid' ? 'text-warn' : 'text-fg-muted'}`}>
            {view.label}
          </span>
          <span className="block text-xs text-fg-dim">{view.hint}</span>
        </span>
      </div>
    );
  }

  const content = (
    <>
      <TeamAvatar team={view.team} size="lg" dimmed={outcome === 'loser'} />
      <span
        className={`line-clamp-2 font-display text-xl leading-tight font-bold tracking-wide break-words uppercase ${
          outcome === 'loser' ? 'text-fg-dim' : 'text-fg'
        }`}
      >
        {view.team.name}
      </span>
    </>
  );

  if (onSelectTeam) {
    return (
      <button
        type="button"
        onClick={() => onSelectTeam(view.team.id)}
        className="flex min-w-0 flex-col items-center gap-2.5 rounded-lg text-center transition hover:opacity-80"
        aria-label={`Ver ficha de ${view.team.name}`}
      >
        {content}
      </button>
    );
  }
  return <div className="flex min-w-0 flex-col items-center gap-2.5 text-center">{content}</div>;
}
