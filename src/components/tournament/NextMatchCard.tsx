import { ArrowRight, CalendarDays, Clock3, Trophy } from 'lucide-react';
import type { ReactNode } from 'react';
import { matchWhen, seriesScore } from '../../lib/display';
import { useLiveStatus, useSelection, useTournament } from '../../state/context';
import type { ResolvedMatch } from '../../types/tournament';
import { VersusSide } from '../matches/VersusSide';
import { Countdown } from './Countdown';

function CardShell({ label, tone = 'default', children }: { label: string; tone?: 'default' | 'live'; children: ReactNode }) {
  return (
    <aside
      aria-label={label}
      className="chamfer relative overflow-hidden border border-line-strong bg-ink-850/85 p-5 shadow-[0_30px_80px_-40px_rgb(0_0_0/0.9)] backdrop-blur-md sm:p-6"
    >
      <div className={`absolute inset-x-0 top-0 h-0.5 ${tone === 'live' ? 'bg-live' : 'bg-accent'}`} aria-hidden="true" />
      {children}
    </aside>
  );
}

function MatchBody({ match, mode }: { match: ResolvedMatch; mode: 'next' | 'live' | 'awaiting' }) {
  const { model } = useTournament();
  const { openMatch } = useSelection();
  const { config } = model;
  const when = matchWhen(match, config);
  const score = seriesScore(match);
  const stage = config.stages[match.definition.stage];

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="eyebrow flex items-center gap-2 text-fg-muted">
          {mode === 'live' && <span className="size-2 animate-pulse-dot rounded-full bg-live" aria-hidden="true" />}
          {mode === 'live' ? 'Ao vivo agora' : mode === 'awaiting' ? 'Aguardando resultado' : 'Próxima partida'}
        </span>
        <span className="flex items-center gap-1.5">
          {config.publicDisplay.showMatchIds && <span className="chip">{match.definition.id}</span>}
          <span className="chip text-accent">{match.definition.format}</span>
        </span>
      </div>

      <p className="mt-4 font-display text-lg font-bold tracking-[0.14em] text-fg-muted uppercase">{stage.label}</p>

      <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-start gap-3">
        <VersusSide slot={match.slots[0]} />
        <span className="pt-3 font-display text-3xl font-extrabold text-fg-dim tabular">
          {score ? (
            <span className="text-fg">
              {score[0]}
              <span className="px-1 text-fg-dim">:</span>
              {score[1]}
            </span>
          ) : (
            'VS'
          )}
        </span>
        <VersusSide slot={match.slots[1]} />
      </div>

      {when && (
        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line pt-4 text-sm text-fg-muted">
          <span className="flex items-center gap-2">
            <CalendarDays className="size-4 text-fg-dim" aria-hidden="true" />
            <span>
              {when.weekdayShort}, {when.date}
            </span>
          </span>
          <span className="flex items-center gap-2">
            <Clock3 className="size-4 text-fg-dim" aria-hidden="true" />
            <span className="font-semibold text-fg tabular">{when.time}</span>
            <span className="text-fg-dim">previsto · {config.schedule.timeZoneLabel}</span>
          </span>
        </div>
      )}

      {mode === 'next' && match.schedule && (
        <div className="mt-4">
          <Countdown target={match.schedule.start} />
        </div>
      )}
      {mode === 'awaiting' && (
        <p className="mt-4 rounded-lg border border-line bg-ink-950/50 px-3 py-2.5 text-sm text-fg-muted">
          O horário previsto já passou. O placar será exibido assim que o resultado for registrado pela organização.
        </p>
      )}

      <button
        type="button"
        onClick={() => openMatch(match.definition.id)}
        className="group mt-5 inline-flex items-center gap-2 font-display text-sm font-bold tracking-[0.14em] text-accent uppercase"
      >
        Detalhes da partida
        <ArrowRight className="size-4 transition group-hover:translate-x-1" aria-hidden="true" />
      </button>
    </>
  );
}

export function NextMatchCard() {
  const { model } = useTournament();
  const { live, next, awaitingResult } = useLiveStatus();

  if (live[0]) {
    return (
      <CardShell label="Partida ao vivo" tone="live">
        <MatchBody match={live[0]} mode="live" />
      </CardShell>
    );
  }
  if (next) {
    return (
      <CardShell label="Próxima partida">
        <MatchBody match={next} mode="next" />
      </CardShell>
    );
  }
  if (awaitingResult[0]) {
    return (
      <CardShell label="Partida aguardando resultado">
        <MatchBody match={awaitingResult[0]} mode="awaiting" />
      </CardShell>
    );
  }

  const champion = model.champion ? model.teamsById.get(model.champion.championId) : null;
  return (
    <CardShell label="Campeonato encerrado">
      <span className="eyebrow">Campeonato encerrado</span>
      <div className="mt-4 flex items-center gap-3">
        <Trophy className="size-8 text-gold" aria-hidden="true" />
        <p className="font-display text-2xl font-bold uppercase">
          {champion ? `${champion.name} é a campeã` : 'Todas as partidas foram disputadas'}
        </p>
      </div>
      <a href={champion ? '#campeao' : '#chaveamento'} className="mt-5 inline-flex items-center gap-2 font-display text-sm font-bold tracking-[0.14em] text-accent uppercase">
        {champion ? 'Ver conquista' : 'Ver chaveamento'} <ArrowRight className="size-4" aria-hidden="true" />
      </a>
    </CardShell>
  );
}
