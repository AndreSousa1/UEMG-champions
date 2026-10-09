import { Crown, Medal } from 'lucide-react';
import { seriesScore } from '../../lib/display';
import { useSelection, useTournament } from '../../state/context';
import { TeamAvatar } from '../teams/TeamAvatar';

/** Só aparece depois que a final é encerrada com resultado válido. */
export function ChampionHighlight() {
  const { model } = useTournament();
  const { openMatch, openTeam } = useSelection();
  const { champion, config } = model;
  if (!champion) return null;

  const winner = model.teamsById.get(champion.championId);
  const runnerUp = model.teamsById.get(champion.runnerUpId);
  if (!winner || !runnerUp) return null;

  const score = seriesScore(champion.finalMatch);
  const winnerSlot = champion.finalMatch.winnerSlot;
  const winnerScore = score && winnerSlot ? score[winnerSlot - 1] : null;
  const loserScore = score && winnerSlot ? score[winnerSlot === 1 ? 1 : 0] : null;

  return (
    <section id="campeao" aria-labelledby="campeao-titulo" className="relative overflow-hidden py-10 sm:py-14">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute top-0 left-1/2 h-[32rem] w-[60rem] -translate-x-1/2 rounded-full bg-gold/[0.07] blur-3xl" />
        <div className="bg-tactical-grid absolute inset-0 [mask-image:radial-gradient(ellipse_50%_60%_at_50%_40%,black,transparent)]" />
      </div>
      <div className="relative mx-auto w-full max-w-5xl px-4 text-center sm:px-6">
        <span className="chip border-gold/40 bg-gold/10 px-3 py-1 text-gold">
          <Crown className="size-3.5" aria-hidden="true" /> Campeã {config.name} {config.year}
        </span>
        <div className="mt-8 flex justify-center">
          <TeamAvatar team={winner} size="xl" />
        </div>
        <h2 id="campeao-titulo" className="mt-6 font-display text-[clamp(2.8rem,9vw,6rem)] leading-[0.9] font-extrabold uppercase">
          {winner.name}
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg text-fg-muted">
          Parabéns à {winner.name}, campeã do {config.displayName}! Uma campanha decidida dentro do servidor, mapa a mapa.
        </p>

        <div className="mx-auto mt-10 flex max-w-xl flex-col items-stretch gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => openMatch(champion.finalMatch.definition.id)}
            className="surface flex-1 px-5 py-4 text-left transition hover:border-gold/40"
          >
            <span className="eyebrow">Placar da final · {champion.finalMatch.definition.format}</span>
            <span className="mt-1 block font-display text-4xl font-extrabold tabular">
              <span className="text-gold">{winnerScore ?? '—'}</span>
              <span className="px-2 text-fg-dim">:</span>
              <span className="text-fg-muted">{loserScore ?? '—'}</span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => openTeam(runnerUp.id)}
            className="surface flex flex-1 items-center gap-3 px-5 py-4 text-left transition hover:border-line-strong"
          >
            <Medal className="size-6 shrink-0 text-fg-muted" aria-hidden="true" />
            <span className="min-w-0">
              <span className="eyebrow">Vice-campeã</span>
              <span className="mt-1 block truncate font-display text-2xl font-bold uppercase">{runnerUp.name}</span>
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
