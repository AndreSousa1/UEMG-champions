import { useTournament } from '../../state/context';
import { Logo } from '../brand/Logo';
import { ExternalLinks } from '../ui/ExternalLinks';
import { NAV_ITEMS } from './nav';

export function Footer() {
  const { model } = useTournament();
  const { config } = model;
  const { organization } = config;

  return (
    <footer className="relative border-t border-line bg-ink-900">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div>
          <Logo placement="footer" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-fg-muted">
            {config.tagline} · {config.game} · {config.year}
          </p>
          {organization.name && <p className="mt-4 text-sm font-semibold text-fg">{organization.name}</p>}
          {organization.description && <p className="mt-1 max-w-sm text-sm text-fg-muted">{organization.description}</p>}
        </div>

        <nav aria-label="Rodapé">
          <h3 className="eyebrow mb-4">Navegação</h3>
          <ul className="space-y-2.5">
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`} className="text-sm text-fg-muted transition hover:text-accent">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h3 className="eyebrow mb-4">Informações</h3>
          <p className="text-sm leading-relaxed text-fg-muted">
            Fuso dos horários: {config.schedule.timeZoneLabel}. Os horários das partidas são previsões e podem
            variar conforme a duração real dos jogos.
          </p>
          <ExternalLinks links={config.officialLinks} className="mt-4" />
        </div>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-fg-dim sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <span>
            © {config.year} {config.name}
          </span>
          <span>Counter-Strike é uma marca da Valve Corporation. Evento sem vínculo com a Valve.</span>
        </div>
      </div>
    </footer>
  );
}
