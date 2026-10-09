import { useLiveStatus, useTournament } from '../../state/context';

/** Indicadores calculados exclusivamente a partir dos dados cadastrados. */
export function StatsStrip() {
  const { model } = useTournament();
  const { phase, currentStage } = useLiveStatus();
  const { stats, config } = model;

  const stageValue =
    phase === 'completed' ? 'Encerrado' : phase === 'not-started' ? 'A iniciar' : currentStage ? config.stages[currentStage].shortLabel : '—';

  const items = [
    { label: 'Equipes', value: stats.totalTeams },
    { label: 'Partidas programadas', value: stats.totalMatches },
    { label: 'Partidas concluídas', value: stats.completedMatches },
    { label: 'Equipes classificadas', value: stats.advancedTeams },
    { label: 'Equipes eliminadas', value: stats.eliminatedTeams },
    { label: 'Etapa atual', value: stageValue },
  ];

  return (
    <section aria-label="Números do campeonato" className="relative border-y border-line bg-ink-900">
      <dl className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-px bg-line sm:grid-cols-3 lg:grid-cols-6">
        {items.map((item) => (
          <div key={item.label} className="flex flex-col justify-between bg-ink-900 px-4 py-5 sm:px-6">
            <dt className="text-[0.68rem] font-semibold tracking-[0.16em] text-fg-dim uppercase">{item.label}</dt>
            <dd className="mt-1 font-display text-3xl font-bold text-fg tabular">{item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
