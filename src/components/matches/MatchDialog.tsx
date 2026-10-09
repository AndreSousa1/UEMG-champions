import { AlertTriangle, ArrowRight, CalendarDays, Clock3, Hourglass, Trophy } from 'lucide-react';
import { matchWhen, seriesScore, slotAt } from '../../lib/display';
import { mapsToWin } from '../../lib/results';
import { useSelection, useTournament } from '../../state/context';
import type { ResolvedMatch } from '../../types/tournament';
import { Dialog } from '../ui/Dialog';
import { MapTable } from './MapScores';
import { MatchStatusBadge } from './MatchStatusBadge';
import { VersusSide } from './VersusSide';

function MatchDetails({ match }: { match: ResolvedMatch }) {
  const { model } = useTournament();
  const { openMatch, openTeam } = useSelection();
  const { config } = model;
  const when = matchWhen(match, config);
  const score = seriesScore(match);
  const def = match.definition;
  const isFinal = match.feedsInto === null && model.matches.length > 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <MatchStatusBadge state={match.state} />
        <span className="chip text-accent">
          {def.format} · melhor de {def.format === 'MD1' ? 'um mapa' : 'três mapas'}
        </span>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-3 rounded-xl border border-line bg-ink-850 p-4 sm:p-5">
        {([1, 2] as const).map((slot) => (
          <div key={slot} className={slot === 2 ? 'order-3' : 'order-1'}>
            <VersusSide
              slot={slotAt(match, slot)}
              outcome={match.winnerSlot === null ? 'none' : match.winnerSlot === slot ? 'winner' : 'loser'}
              onSelectTeam={openTeam}
            />
          </div>
        ))}
        <div className="order-2 pt-2 text-center">
          {score ? (
            <div className="font-display text-4xl font-extrabold tabular">
              <span className={match.winnerSlot === 1 ? 'text-accent' : 'text-fg'}>{score[0]}</span>
              <span className="px-1.5 text-fg-dim">:</span>
              <span className={match.winnerSlot === 2 ? 'text-accent' : 'text-fg'}>{score[1]}</span>
            </div>
          ) : (
            <div className="font-display text-xl font-bold tracking-[0.2em] text-fg-dim">VS</div>
          )}
          <div className="mt-0.5 text-[0.64rem] font-semibold tracking-[0.16em] text-fg-dim uppercase">
            {score ? (def.format === 'MD1' ? 'mapas' : 'série') : def.format}
          </div>
        </div>
      </div>

      <dl className="grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3">
        <div className="bg-ink-900 px-4 py-3">
          <dt className="flex items-center gap-1.5 text-[0.68rem] font-semibold tracking-[0.14em] text-fg-dim uppercase">
            <CalendarDays className="size-3.5" aria-hidden="true" /> Data
          </dt>
          <dd className="mt-1 text-fg">{when ? `${when.weekday}, ${when.date}` : 'A confirmar'}</dd>
        </div>
        <div className="bg-ink-900 px-4 py-3">
          <dt className="flex items-center gap-1.5 text-[0.68rem] font-semibold tracking-[0.14em] text-fg-dim uppercase">
            <Clock3 className="size-3.5" aria-hidden="true" /> {match.schedule?.isFixedTime ? 'Horário' : 'Horário previsto'}
          </dt>
          <dd className="mt-1 text-fg tabular">{when ? `${when.time} – ${when.endTime}` : 'A confirmar'}</dd>
        </div>
        <div className="bg-ink-900 px-4 py-3">
          <dt className="flex items-center gap-1.5 text-[0.68rem] font-semibold tracking-[0.14em] text-fg-dim uppercase">
            <Hourglass className="size-3.5" aria-hidden="true" /> Duração estimada
          </dt>
          <dd className="mt-1 text-fg">{match.schedule ? `${match.schedule.durationMinutes} min` : '—'}</dd>
        </div>
      </dl>
      <p className="-mt-3 text-xs text-fg-dim">
        {config.schedule.timeZoneLabel}. Previsão sujeita à duração real das partidas anteriores. Vence a série quem conquistar{' '}
        {mapsToWin(def.format) === 1 ? 'o mapa' : `${mapsToWin(def.format)} mapas`} primeiro.
      </p>

      <div>
        <h3 className="eyebrow mb-3">Mapas</h3>
        <MapTable match={match} />
      </div>

      {match.problems.length > 0 && (
        <div className="rounded-xl border border-warn/30 bg-warn/[0.06] p-4 text-sm">
          <p className="flex items-center gap-2 font-semibold text-warn">
            <AlertTriangle className="size-4" aria-hidden="true" /> Dados em revisão
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-fg-muted">
            {match.problems.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h3 className="eyebrow mb-3">Caminho no chaveamento</h3>
        <ul className="space-y-2 text-sm text-fg-muted">
          {match.slots.map((slot, i) => {
            if (!('winnerOf' in slot.source)) return null;
            const origin = slot.source.winnerOf;
            return (
              <li key={i} className="flex flex-wrap items-center gap-1.5">
                Vaga {i + 1}: vencedor de
                <button type="button" onClick={() => openMatch(origin)} className="font-semibold text-fg underline decoration-line-strong underline-offset-4 hover:text-accent">
                  {origin}
                </button>
              </li>
            );
          })}
          <li className="flex flex-wrap items-center gap-1.5">
            {match.feedsInto ? (
              <>
                <ArrowRight className="size-4 text-accent" aria-hidden="true" /> O vencedor avança para
                <button
                  type="button"
                  onClick={() => openMatch(match.feedsInto!.matchId)}
                  className="font-semibold text-fg underline decoration-line-strong underline-offset-4 hover:text-accent"
                >
                  {match.feedsInto.matchId}
                </button>
                ({config.stages[model.matchesById.get(match.feedsInto.matchId)?.definition.stage ?? 'final'].label.toLowerCase()}).
              </>
            ) : isFinal ? (
              <>
                <Trophy className="size-4 text-gold" aria-hidden="true" /> O vencedor é o campeão do {config.displayName}.
              </>
            ) : null}
          </li>
        </ul>
      </div>

      {def.note && <p className="rounded-lg border border-line bg-ink-850 px-4 py-3 text-sm text-fg-muted">{def.note}</p>}
    </div>
  );
}

export function MatchDialog() {
  const { model } = useTournament();
  const { selection, close } = useSelection();
  const match = selection?.type === 'match' ? model.matchesById.get(selection.id) : undefined;
  const stage = match ? model.config.stages[match.definition.stage].label : '';

  return (
    <Dialog
      open={Boolean(match)}
      onClose={close}
      eyebrow={match ? `${stage}${model.config.publicDisplay.showMatchIds ? ` · ${match.definition.id}` : ''}` : undefined}
      title={match ? 'Detalhes da partida' : ''}
    >
      {match && <MatchDetails key={match.definition.id} match={match} />}
    </Dialog>
  );
}
