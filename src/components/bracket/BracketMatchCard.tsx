import type { CSSProperties } from 'react';
import { MATCH_STATE_LABEL, matchWhen, seriesScore, slotView } from '../../lib/display';
import { useSelection, useTournament } from '../../state/context';
import type { ResolvedMatch, ResolvedSlot } from '../../types/tournament';
import { EmptyAvatar, TeamAvatar } from '../teams/TeamAvatar';

interface BracketMatchCardProps {
  match: ResolvedMatch;
  style: CSSProperties;
  hoveredTeam: string | null;
  onHoverTeam: (teamId: string | null) => void;
}

function TeamRow({
  slot,
  score,
  outcome,
  highlighted,
  onHoverTeam,
}: {
  slot: ResolvedSlot;
  score: number | null;
  outcome: 'winner' | 'loser' | 'none';
  highlighted: boolean;
  onHoverTeam: (teamId: string | null) => void;
}) {
  const { model } = useTournament();
  const view = slotView(slot, model.teamsById);
  const teamId = view.kind === 'team' ? view.team.id : null;

  return (
    <div
      onMouseEnter={() => onHoverTeam(teamId)}
      onMouseLeave={() => onHoverTeam(null)}
      className={`relative flex h-[38px] items-center gap-2 pr-0 pl-2.5 transition-colors ${
        highlighted ? 'bg-accent/[0.08]' : ''
      }`}
    >
      {outcome === 'winner' && <span className="absolute inset-y-1.5 left-0 w-[3px] rounded-r bg-accent" aria-hidden="true" />}
      {view.kind === 'team' ? (
        <TeamAvatar team={view.team} size="xs" dimmed={outcome === 'loser'} />
      ) : (
        <EmptyAvatar size="xs" />
      )}
      <span className="min-w-0 flex-1 truncate text-[0.86rem]" title={view.kind === 'team' ? view.team.name : view.hint}>
        {view.kind === 'team' ? (
          <span className={outcome === 'winner' ? 'font-semibold text-fg' : outcome === 'loser' ? 'text-fg-dim line-through decoration-fg-dim/40' : 'text-fg'}>
            {view.team.name}
          </span>
        ) : (
          <span className={`italic ${view.kind === 'invalid' ? 'text-warn' : 'text-fg-dim'}`}>
            {view.label}
            <span className="ml-1.5 text-[0.7rem] not-italic text-fg-dim/80">{view.hint.replace('Vencedor de ', 'venc. ')}</span>
          </span>
        )}
      </span>
      <span
        className={`grid h-full w-9 shrink-0 place-items-center border-l border-line font-display text-lg font-bold tabular ${
          outcome === 'winner' ? 'bg-accent/[0.12] text-accent' : outcome === 'loser' ? 'text-fg-dim' : 'text-fg-muted'
        }`}
      >
        {score ?? ''}
      </span>
    </div>
  );
}

export function BracketMatchCard({ match, style, hoveredTeam, onHoverTeam }: BracketMatchCardProps) {
  const { model } = useTournament();
  const { openMatch } = useSelection();
  const { config } = model;
  const when = matchWhen(match, config);
  const score = seriesScore(match);
  const id = match.definition.id;

  const outcomeFor = (slot: 1 | 2) => (match.winnerSlot === null ? 'none' : match.winnerSlot === slot ? 'winner' : 'loser');
  const names = match.slots.map((s) => {
    const v = slotView(s, model.teamsById);
    return v.kind === 'team' ? v.team.name : `${v.label} (${v.hint})`;
  });
  const label = `${config.stages[match.definition.stage].label}, ${id}, ${match.definition.format}: ${names[0]} contra ${names[1]}${
    score ? `, placar ${score[0]} a ${score[1]}` : ''
  }. ${MATCH_STATE_LABEL[match.state]}${when ? `, ${when.dayMonth} às ${when.time}` : ''}. Abrir detalhes.`;

  const isTeamHighlighted = (slot: ResolvedSlot) => slot.kind === 'team' && slot.teamId === hoveredTeam;

  const border =
    match.state === 'live'
      ? 'border-live/50'
      : match.state === 'invalid'
        ? 'border-warn/40'
        : match.state === 'completed'
          ? 'border-line'
          : 'border-line-strong';

  return (
    <div className="absolute" style={style}>
      <button
        type="button"
        onClick={() => openMatch(id)}
        aria-label={label}
        className={`group flex h-full w-full flex-col overflow-hidden rounded-lg border bg-ink-800 text-left shadow-[0_12px_30px_-18px_rgb(0_0_0/0.9)] transition duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:bg-ink-750 ${border} ${
          match.state === 'completed' ? 'bg-ink-850' : ''
        }`}
      >
        <div className="flex h-[26px] shrink-0 items-center justify-between border-b border-line bg-ink-900/60 px-2.5 text-[0.66rem] font-semibold tracking-[0.12em] uppercase">
          <span className="flex items-center gap-1.5 text-fg-dim">
            {config.publicDisplay.showMatchIds && <span className="text-fg-muted">{id}</span>}
            <span className="text-accent/80">{match.definition.format}</span>
          </span>
          <span className="tabular">
            {match.state === 'live' ? (
              <span className="flex items-center gap-1 text-live">
                <span className="size-1.5 animate-pulse-dot rounded-full bg-live" aria-hidden="true" /> Ao vivo
              </span>
            ) : match.state === 'completed' ? (
              <span className="text-fg-dim">Encerrada</span>
            ) : match.state === 'invalid' ? (
              <span className="text-warn">Em revisão</span>
            ) : match.state === 'postponed' ? (
              <span className="text-warn">Adiada</span>
            ) : when ? (
              <span className="text-fg-muted">
                {when.dayMonth} · <span className="text-fg">{when.time}</span>
              </span>
            ) : null}
          </span>
        </div>
        <TeamRow slot={match.slots[0]} score={score ? score[0] : null} outcome={outcomeFor(1)} highlighted={isTeamHighlighted(match.slots[0])} onHoverTeam={onHoverTeam} />
        <div className="h-px bg-line" aria-hidden="true" />
        <TeamRow slot={match.slots[1]} score={score ? score[1] : null} outcome={outcomeFor(2)} highlighted={isTeamHighlighted(match.slots[1])} onHoverTeam={onHoverTeam} />
      </button>
    </div>
  );
}
