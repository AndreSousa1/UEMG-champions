import { CheckCircle2, ChevronRight } from 'lucide-react';
import { matchWhen, scoreAt, seriesScore, slotAt } from '../../lib/display';
import { useSelection, useTournament } from '../../state/context';
import type { ResolvedMatch } from '../../types/tournament';
import { MapChips } from './MapScores';
import { MatchStatusBadge } from './MatchStatusBadge';
import { SlotLabel } from './SlotLabel';

function ScoreBox({ value, outcome }: { value: number | null; outcome: 'winner' | 'loser' | 'none' }) {
  return (
    <span
      className={`grid h-9 w-9 place-items-center rounded-md font-display text-xl font-bold tabular ${
        outcome === 'winner' ? 'bg-accent text-accent-ink' : outcome === 'loser' ? 'bg-white/[0.04] text-fg-dim' : 'bg-white/[0.04] text-fg-muted'
      }`}
    >
      {value ?? '–'}
    </span>
  );
}

export function MatchRow({ match }: { match: ResolvedMatch }) {
  const { model } = useTournament();
  const { openMatch } = useSelection();
  const { config } = model;
  const when = matchWhen(match, config);
  const score = seriesScore(match);
  const outcome = (slot: 1 | 2) => (match.winnerSlot === null ? 'none' : match.winnerSlot === slot ? 'winner' : 'loser');
  const stage = config.stages[match.definition.stage];
  const isDone = match.state === 'completed';

  return (
    <li>
      <button
        type="button"
        onClick={() => openMatch(match.definition.id)}
        aria-label={`Detalhes da partida ${match.definition.id}`}
        className={`group relative grid w-full grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-3 rounded-xl border px-4 py-4 text-left transition duration-200 hover:border-accent/40 hover:bg-ink-750 sm:px-5 md:grid-cols-[84px_170px_1fr_150px_auto] ${
          isDone ? 'border-line bg-ink-900' : match.state === 'live' ? 'border-live/40 bg-ink-800' : 'border-line bg-ink-850'
        }`}
      >
        {/* Horário */}
        <div className="flex flex-col">
          <span className={`font-display text-[1.65rem] leading-none font-bold tabular ${isDone ? 'text-fg-dim' : 'text-fg'}`}>
            {when?.time ?? '--:--'}
          </span>
          <span className="mt-1 text-[0.64rem] font-semibold tracking-[0.14em] text-fg-dim uppercase">
            {match.schedule?.isFixedTime ? 'horário fixo' : 'previsto'}
          </span>
        </div>

        {/* Fase e formato */}
        <div className="min-w-0">
          <span className="block truncate font-display text-[0.95rem] font-bold tracking-[0.1em] text-fg-muted uppercase">{stage.label}</span>
          <span className="mt-1 flex items-center gap-1.5">
            {config.publicDisplay.showMatchIds && <span className="chip px-1.5 py-0">{match.definition.id}</span>}
            <span className="chip px-1.5 py-0 text-accent">{match.definition.format}</span>
          </span>
        </div>

        <ChevronRight className="size-5 text-fg-dim transition group-hover:translate-x-0.5 group-hover:text-accent md:col-start-5 md:row-start-1" aria-hidden="true" />

        {/* Equipes — celular */}
        <div className="col-span-3 space-y-2 md:hidden">
          {([1, 2] as const).map((slot) => (
            <div key={slot} className="flex items-center justify-between gap-3">
              <SlotLabel slot={slotAt(match, slot)} size="sm" dimmed={outcome(slot) === 'loser'} emphasis={outcome(slot) === 'winner'} />
              {score && <ScoreBox value={scoreAt(score, slot)} outcome={outcome(slot)} />}
            </div>
          ))}
        </div>

        {/* Equipes — desktop */}
        <div className="hidden min-w-0 grid-cols-[1fr_auto_1fr] items-center gap-4 md:col-start-3 md:row-start-1 md:grid">
          <SlotLabel slot={match.slots[0]} size="sm" align="right" dimmed={outcome(1) === 'loser'} emphasis={outcome(1) === 'winner'} />
          <span className="flex items-center gap-1.5">
            {score ? (
              <>
                <ScoreBox value={score[0]} outcome={outcome(1)} />
                <ScoreBox value={score[1]} outcome={outcome(2)} />
              </>
            ) : (
              <span className="w-[78px] text-center font-display text-sm font-bold tracking-[0.2em] text-fg-dim">VS</span>
            )}
          </span>
          <SlotLabel slot={match.slots[1]} size="sm" dimmed={outcome(2) === 'loser'} emphasis={outcome(2) === 'winner'} />
        </div>

        {/* Situação */}
        <div className="col-span-3 flex flex-wrap items-center gap-2 md:col-span-1 md:col-start-4 md:row-start-1 md:flex-col md:items-end md:gap-1.5">
          <MatchStatusBadge state={match.state} />
          {isDone && (
            <span className="flex items-center gap-1 text-[0.7rem] text-fg-dim">
              <CheckCircle2 className="size-3.5 text-accent/70" aria-hidden="true" /> Resultado registrado
            </span>
          )}
        </div>

        {score && (
          <div className="col-span-3 md:col-span-1 md:col-start-3 md:row-start-2 md:-mt-1">
            <MapChips match={match} className="md:justify-center" />
          </div>
        )}
      </button>
    </li>
  );
}
