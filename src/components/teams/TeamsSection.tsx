import { useTournament } from '../../state/context';
import { Section } from '../layout/Section';
import { TeamCard } from './TeamCard';

export function TeamsSection() {
  const { model } = useTournament();
  const placeholders = model.teams.filter((t) => t.isPlaceholder).length;

  return (
    <Section
      id="equipes"
      title="Equipes inscritas"
      description={
        placeholders > 0
          ? `${model.teams.length} vagas confirmadas no chaveamento. Nomes e elencos ${
              placeholders === model.teams.length ? 'serão' : 'restantes serão'
            } publicados conforme a confirmação da organização.`
          : `${model.teams.length} equipes na disputa pelo título. Toque em uma equipe para ver a ficha completa.`
      }
    >
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {model.teams.map((team) => (
          <TeamCard key={team.id} team={team} />
        ))}
      </ul>
    </Section>
  );
}
