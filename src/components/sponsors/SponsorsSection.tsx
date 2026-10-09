import { useTournament } from '../../state/context';
import { Section } from '../layout/Section';
import { SponsorCard } from './SponsorCard';

export function SponsorsSection() {
  const { model } = useTournament();
  const { sponsors } = model;
  if (sponsors.length === 0) return null;

  const alone = sponsors.length === 1;
  const featured = sponsors.filter((s) => s.featured || alone);
  const standard = sponsors.filter((s) => !s.featured && !alone);

  return (
    <Section
      id="patrocinadores"
      title={alone ? 'Patrocinador oficial' : 'Patrocinadores oficiais'}
      description={`${alone ? 'Marca parceira' : 'Marcas parceiras'} do ${model.config.name} em ${model.config.year}.`}
    >
      <div className="space-y-4">
        {featured.map((sponsor) => (
          <SponsorCard key={sponsor.id} sponsor={sponsor} variant="featured" />
        ))}
        {standard.length > 0 && (
          <ul className="flex flex-wrap justify-center gap-4">
            {standard.map((sponsor) => (
              <li key={sponsor.id} className="w-full sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-2rem)/3)]">
                <SponsorCard sponsor={sponsor} variant="standard" />
              </li>
            ))}
          </ul>
        )}
      </div>
    </Section>
  );
}
