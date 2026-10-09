import { CalendarX2 } from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';
import { dayLabel } from '../../lib/display';
import { stagesInUse } from '../../lib/tournament-status';
import { useTournament } from '../../state/context';
import type { StageId } from '../../types/tournament';
import { Section } from '../layout/Section';
import { MatchRow } from './MatchRow';

type DayFilter = 'all' | string;
type StageFilter = 'all' | StageId;

function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 rounded-lg border px-3.5 py-2 text-left transition ${
        active ? 'border-accent/50 bg-accent/10 text-fg' : 'border-line bg-ink-900 text-fg-muted hover:border-line-strong hover:text-fg'
      }`}
    >
      {children}
    </button>
  );
}

export function MatchesSection() {
  const { model } = useTournament();
  const { config } = model;
  const [day, setDay] = useState<DayFilter>('all');
  const [stage, setStage] = useState<StageFilter>('all');
  const [onlyUpcoming, setOnlyUpcoming] = useState(false);

  const days = useMemo(() => Object.keys(config.schedule.days).sort(), [config.schedule.days]);
  const stages = useMemo(() => stagesInUse(model.matches), [model.matches]);

  const filtered = model.matches.filter(
    (m) =>
      (day === 'all' || m.definition.date === day) &&
      (stage === 'all' || m.definition.stage === stage) &&
      (!onlyUpcoming || m.state !== 'completed'),
  );

  const groups = days
    .map((date) => ({ date, matches: filtered.filter((m) => m.definition.date === date) }))
    .filter((g) => g.matches.length > 0);
  const unscheduled = filtered.filter((m) => !days.includes(m.definition.date));

  const completedCount = model.stats.completedMatches;
  const hasFilters = day !== 'all' || stage !== 'all' || onlyUpcoming;

  const clear = () => {
    setDay('all');
    setStage('all');
    setOnlyUpcoming(false);
  };

  return (
    <Section
      id="partidas"
      title="Agenda das partidas"
      description={
        <>
          Horários ({config.schedule.timeZoneLabel}) calculados a partir do início de cada dia e da duração estimada de
          cada formato (MD1 ≈ {config.schedule.durationsMinutes.MD1} min, MD3 ≈ {config.schedule.durationsMinutes.MD3} min). São previsões e
          podem mudar conforme a duração real dos jogos.
        </>
      }
      aside={
        <p className="text-sm text-fg-muted">
          <span className="font-display text-2xl font-bold text-fg tabular">{completedCount}</span>
          <span className="text-fg-dim">/{model.stats.totalMatches}</span> resultados registrados
        </p>
      }
    >
      <div className="mb-8 space-y-4">
        <div role="group" aria-label="Filtrar por dia" className="scrollbar-thin -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
          <FilterButton active={day === 'all'} onClick={() => setDay('all')}>
            <span className="block text-[0.66rem] font-semibold tracking-[0.14em] text-fg-dim uppercase">Todos</span>
            <span className="block font-display text-lg leading-tight font-bold uppercase">{days.length} dias</span>
          </FilterButton>
          {days.map((date) => {
            const l = dayLabel(date, config);
            const dayStages = [...new Set(model.matches.filter((m) => m.definition.date === date).map((m) => m.definition.stage))];
            return (
              <FilterButton key={date} active={day === date} onClick={() => setDay(date)}>
                <span className="block text-[0.66rem] font-semibold tracking-[0.14em] text-fg-dim uppercase">
                  {l.weekdayShort} · {dayStages.map((s) => config.stages[s].shortLabel).join(' / ') || 'sem partidas'}
                </span>
                <span className="block font-display text-lg leading-tight font-bold tabular">{l.dayMonth}</span>
              </FilterButton>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div role="group" aria-label="Filtrar por fase" className="scrollbar-thin -mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
            {(['all', ...stages] as const).map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={stage === s}
                onClick={() => setStage(s)}
                className={`shrink-0 rounded-full border px-3.5 py-1.5 font-display text-sm font-semibold tracking-[0.1em] uppercase transition ${
                  stage === s ? 'border-accent/50 bg-accent/10 text-accent' : 'border-line text-fg-muted hover:text-fg'
                }`}
              >
                {s === 'all' ? 'Todas as fases' : config.stages[s].label}
              </button>
            ))}
          </div>

          <label className="flex shrink-0 cursor-pointer items-center gap-3 text-sm text-fg-muted select-none">
            <input
              type="checkbox"
              role="switch"
              checked={onlyUpcoming}
              onChange={(e) => setOnlyUpcoming(e.target.checked)}
              className="peer sr-only"
            />
            <span
              aria-hidden="true"
              className="relative h-6 w-11 rounded-full border border-line-strong bg-ink-800 transition peer-checked:border-accent/60 peer-checked:bg-accent/20 peer-focus-visible:outline-2 peer-focus-visible:outline-accent after:absolute after:top-0.5 after:left-0.5 after:size-4.5 after:rounded-full after:bg-fg-muted after:transition peer-checked:after:translate-x-5 peer-checked:after:bg-accent"
            />
            Somente partidas a disputar
          </label>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {filtered.length} {filtered.length === 1 ? 'partida encontrada' : 'partidas encontradas'}
      </p>

      {filtered.length === 0 ? (
        <div className="surface flex flex-col items-center px-6 py-14 text-center">
          <CalendarX2 className="size-10 text-fg-dim" aria-hidden="true" />
          <p className="mt-4 font-display text-xl font-bold uppercase">Nenhuma partida encontrada</p>
          <p className="mt-1 max-w-sm text-sm text-fg-muted">
            {onlyUpcoming ? 'Todas as partidas deste filtro já têm resultado registrado.' : 'Não há partidas para a combinação de filtros escolhida.'}
          </p>
          {hasFilters && (
            <button type="button" onClick={clear} className="btn btn-ghost mt-6 py-2.5 text-sm">
              Limpar filtros
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-10">
          {groups.map((group) => {
            const l = dayLabel(group.date, config);
            const startTime = config.schedule.days[group.date]?.startTime;
            const groupStages = [...new Set(group.matches.map((m) => m.definition.stage))];
            return (
              <div key={group.date}>
                <div className="mb-4 flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-line pb-3">
                  <h3 className="font-display text-2xl font-bold uppercase">
                    {l.weekday}
                    <span className="ml-2 text-fg-dim tabular">{l.date}</span>
                  </h3>
                  <span className="text-sm text-fg-muted">
                    {groupStages.map((s) => config.stages[s].label).join(' · ')}
                    {startTime && <> · início às {startTime}</>}
                  </span>
                </div>
                <ul className="space-y-2.5">
                  {group.matches.map((m) => (
                    <MatchRow key={m.definition.id} match={m} />
                  ))}
                </ul>
              </div>
            );
          })}
          {unscheduled.length > 0 && (
            <div>
              <h3 className="mb-4 border-b border-line pb-3 font-display text-2xl font-bold uppercase text-warn">Data a confirmar</h3>
              <ul className="space-y-2.5">
                {unscheduled.map((m) => (
                  <MatchRow key={m.definition.id} match={m} />
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </Section>
  );
}
