import type { Sponsor } from '../../types/sponsor';
import { PAYMENT_ICONS, SERVICE_ICONS } from './sponsor-icons';
import { SponsorActions } from './SponsorActions';
import { SponsorLogo } from './SponsorLogo';

function PaymentMethods({ sponsor }: { sponsor: Sponsor }) {
  if (sponsor.paymentMethods.length === 0 || sponsor.displaySettings.showPaymentMethods === false) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[0.68rem] font-semibold tracking-[0.16em] text-fg-dim uppercase">Formas de pagamento</span>
      <ul className="flex flex-wrap gap-1.5">
        {sponsor.paymentMethods.map((method) => {
          const Icon = PAYMENT_ICONS[method.kind];
          return (
            <li key={method.id} className="chip px-2.5 py-1 text-fg">
              <Icon className="size-3.5 text-accent" aria-hidden="true" />
              {method.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Services({ sponsor, compact }: { sponsor: Sponsor; compact: boolean }) {
  if (sponsor.services.length === 0 || sponsor.displaySettings.showServices === false) return null;
  return (
    <ul
      className={compact ? 'space-y-3' : 'grid gap-3 sm:grid-cols-2 xl:grid-cols-3'}
      aria-label={`Serviços da ${sponsor.name}`}
    >
      {sponsor.services.map((service) => {
        const Icon = SERVICE_ICONS[service.icon ?? 'generic'];
        return compact ? (
          <li key={service.id} className="flex gap-3">
            <Icon className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
            <div>
              <h4 className="font-display text-base leading-tight font-bold uppercase">{service.title}</h4>
              <p className="mt-0.5 text-sm leading-relaxed text-fg-muted">{service.description}</p>
            </div>
          </li>
        ) : (
          <li
            key={service.id}
            className="flex gap-3 rounded-lg border border-line bg-ink-900/70 p-3.5 transition hover:border-accent/30 sm:block sm:p-4"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-md border border-accent/25 bg-accent/[0.07] text-accent">
              <Icon className="size-4.5" aria-hidden="true" />
            </span>
            <div>
              <h4 className="font-display text-lg leading-tight font-bold uppercase sm:mt-3">{service.title}</h4>
              <p className="mt-1 text-sm leading-relaxed text-fg-muted">{service.description}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/** Cartão em largura total para o patrocinador em destaque. */
function FeaturedSponsorCard({ sponsor }: { sponsor: Sponsor }) {
  const showDescription = sponsor.displaySettings.showDescription !== false;
  return (
    <article
      aria-labelledby={`patrocinador-${sponsor.id}`}
      className="group relative overflow-hidden rounded-xl border border-line bg-ink-850 transition duration-300 hover:border-accent/30"
    >
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />
      <div className="grid lg:grid-cols-[minmax(0,360px)_1fr]">
        <div className="relative border-b border-line lg:border-r lg:border-b-0">
          <SponsorLogo sponsor={sponsor} defaultPadding={0} className="h-52 w-full sm:h-72 lg:h-full lg:min-h-[360px]" />
        </div>

        <div className="flex flex-col p-6 sm:p-8 lg:p-10">
          <span className="eyebrow text-accent">{sponsor.category}</span>
          <h3 id={`patrocinador-${sponsor.id}`} className="mt-1.5 font-display text-[clamp(2rem,4vw,2.75rem)] leading-none font-extrabold uppercase">
            {sponsor.name}
          </h3>
          {showDescription && (
            <div className="mt-4 max-w-3xl space-y-3">
              <p className="leading-relaxed text-fg-muted">{sponsor.description}</p>
              {sponsor.about && <p className="text-sm leading-relaxed text-fg-dim">{sponsor.about}</p>}
            </div>
          )}

          <div className="mt-7">
            <Services sponsor={sponsor} compact={false} />
          </div>

          <div className="mt-7 flex flex-col gap-5 border-t border-line pt-6 xl:flex-row xl:items-center xl:justify-between">
            <PaymentMethods sponsor={sponsor} />
            <SponsorActions sponsor={sponsor} />
          </div>
        </div>
      </div>
    </article>
  );
}

/** Cartão compacto para os demais patrocinadores. */
function StandardSponsorCard({ sponsor }: { sponsor: Sponsor }) {
  const showDescription = sponsor.displaySettings.showDescription !== false;
  return (
    <article
      aria-labelledby={`patrocinador-${sponsor.id}`}
      className="flex h-full flex-col rounded-xl border border-line bg-ink-850 p-5 transition duration-200 hover:-translate-y-1 hover:border-accent/40"
    >
      <SponsorLogo sponsor={sponsor} defaultPadding={16} className="h-32 rounded-lg border border-line" />
      <span className="eyebrow mt-5 text-accent">{sponsor.category}</span>
      <h3 id={`patrocinador-${sponsor.id}`} className="mt-1 font-display text-2xl leading-tight font-bold uppercase">
        {sponsor.name}
      </h3>
      {showDescription && <p className="mt-2 text-sm leading-relaxed text-fg-muted">{sponsor.description}</p>}
      {sponsor.services.length > 0 && sponsor.displaySettings.showServices !== false && (
        <div className="mt-4 border-t border-line pt-4">
          <Services sponsor={sponsor} compact />
        </div>
      )}
      <div className="mt-auto space-y-4 pt-5">
        <PaymentMethods sponsor={sponsor} />
        <SponsorActions sponsor={sponsor} compact />
      </div>
    </article>
  );
}

export function SponsorCard({ sponsor, variant }: { sponsor: Sponsor; variant: 'featured' | 'standard' }) {
  return variant === 'featured' ? <FeaturedSponsorCard sponsor={sponsor} /> : <StandardSponsorCard sponsor={sponsor} />;
}
