import { Clock3, Crosshair, Layers3 } from 'lucide-react';
import { dayLabel } from '../../lib/display';
import { stagesInUse } from '../../lib/tournament-status';
import { useLiveStatus, useTournament } from '../../state/context';
import { Section } from '../layout/Section';

export function FormatSection() {
  const { model } = useTournament();
  const { currentStage, phase } = useLiveStatus();
  const { config } = model;
  const stages = stagesInUse(model.matches);
  const { schedule } = config;

  return (
    <Section
      id="formato"
      index="04"
      eyebrow="Formato do campeonato"
      title="Como funciona"
      description={`${config.formatLabel}: quem perde está fora, quem vence avança. ${model.stats.totalTeams} equipes, ${model.stats.totalMatches} partidas e um campeão.`}
    >
      <ol className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {stages.map((stage, i) => {
          const matches = model.matches.filter((m) => m.definition.stage === stage);
          const dates = [...new Set(matches.map((m) => m.definition.date))].sort();
          const formats = [...new Set(matches.map((m) => m.definition.format))];
          const directTeams = matches.flatMap((m) =>
            m.slots.flatMap((s) => ('team' in s.source && i > 0 ? [model.teamsById.get(s.source.team)?.name ?? s.source.team] : [])),
          );
          const isCurrent = phase === 'in-progress' && currentStage === stage;
          return (
            <li
              key={stage}
              className={`relative flex flex-col rounded-xl border p-5 ${isCurrent ? 'border-accent/50 bg-accent/[0.04]' : 'border-line bg-ink-850'}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-5xl leading-none font-extrabold text-white/10 tabular">{String(i + 1).padStart(2, '0')}</span>
                <span className="flex gap-1.5">
                  {isCurrent && <span className="chip border-accent/40 text-accent">Fase atual</span>}
                  {formats.map((f) => (
                    <span key={f} className="chip text-accent">
                      {f}
                    </span>
                  ))}
                </span>
              </div>
              <h3 className="mt-4 font-display text-2xl font-bold uppercase">{config.stages[stage].label}</h3>
              <p className="mt-1 text-sm font-semibold text-fg-muted">
                {dates
                  .map((d) => {
                    const l = dayLabel(d, config);
                    return `${l.weekdayShort}, ${l.dayMonth}`;
                  })
                  .join(' e ')}{' '}
                · {matches.length} {matches.length === 1 ? 'partida' : 'partidas'}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-fg-muted">{config.stages[stage].description}</p>
              {directTeams.length > 0 && (
                <p className="mt-3 border-t border-line pt-3 text-xs text-fg-dim">
                  Entram diretamente nesta fase: <span className="text-fg-muted">{directTeams.join(', ')}</span>
                </p>
              )}
            </li>
          );
        })}
      </ol>

      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        <div className="rounded-xl border border-line bg-ink-850 p-5">
          <Crosshair className="size-5 text-accent" aria-hidden="true" />
          <h3 className="mt-3 font-display text-xl font-bold uppercase">MD1 · Melhor de um</h3>
          <p className="mt-2 text-sm leading-relaxed text-fg-muted">
            Um único mapa decide o confronto: quem vencer o mapa avança. Os rounds do mapa aparecem junto ao resultado.
          </p>
        </div>
        <div className="rounded-xl border border-line bg-ink-850 p-5">
          <Layers3 className="size-5 text-accent" aria-hidden="true" />
          <h3 className="mt-3 font-display text-xl font-bold uppercase">MD3 · Melhor de três</h3>
          <p className="mt-2 text-sm leading-relaxed text-fg-muted">
            Vence a série quem conquistar dois mapas primeiro. O placar principal é o da série (ex.: 2–1); os rounds de cada mapa aparecem
            nos detalhes da partida.
          </p>
        </div>
        <div className="rounded-xl border border-line bg-ink-850 p-5">
          <Clock3 className="size-5 text-accent" aria-hidden="true" />
          <h3 className="mt-3 font-display text-xl font-bold uppercase">Horários</h3>
          <ul className="mt-2 space-y-1 text-sm text-fg-muted">
            <li>
              Início diário: <span className="text-fg tabular">{[...new Set(Object.values(schedule.days).map((d) => d.startTime))].join(' / ')}</span>
            </li>
            <li>
              Duração estimada: MD1 ≈ <span className="text-fg">{schedule.durationsMinutes.MD1} min</span>, MD3 ≈{' '}
              <span className="text-fg">{schedule.durationsMinutes.MD3} min</span>
            </li>
            {schedule.gapMinutes > 0 && (
              <li>
                Intervalo entre partidas: <span className="text-fg">{schedule.gapMinutes} min</span>
              </li>
            )}
            <li>{schedule.timeZoneLabel}. Os horários são previsões, não durações garantidas.</li>
          </ul>
        </div>
      </div>
    </Section>
  );
}
