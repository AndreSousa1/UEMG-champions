import { useTournament } from '../../state/context';
import { Section } from '../layout/Section';
import { BracketView } from './BracketView';

function Legend() {
  const items = [
    { swatch: <span className="h-3.5 w-[3px] rounded bg-accent" />, label: 'Vencedora — avança' },
    { swatch: <span className="text-fg-dim line-through">Abc</span>, label: 'Eliminada' },
    { swatch: <span className="size-3.5 rounded border border-dashed border-line-strong" />, label: 'Vaga a definir / entrada direta' },
    { swatch: <span className="size-2 rounded-full bg-live" />, label: 'Ao vivo' },
  ];
  return (
    <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs text-fg-muted">
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-2">
          <span className="flex w-6 justify-center text-xs" aria-hidden="true">
            {item.swatch}
          </span>
          {item.label}
        </li>
      ))}
    </ul>
  );
}

export function BracketSection() {
  const { model } = useTournament();
  const { stats, config } = model;
  return (
    <Section
      id="chaveamento"
      index="01"
      eyebrow="Chaveamento"
      title="Caminho até o título"
      description={
        <>
          {config.formatLabel} com {stats.totalTeams} equipes e {stats.totalMatches} partidas. Cada vitória leva a equipe à fase
          seguinte; as vagas são preenchidas automaticamente conforme os resultados são registrados. Toque em uma partida para ver
          horário, formato e mapas.
        </>
      }
      className="[&>div]:max-w-[1400px]"
    >
      <BracketView />
      <Legend />
    </Section>
  );
}
