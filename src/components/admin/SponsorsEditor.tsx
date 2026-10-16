import type { TournamentData } from '../../lib/tournament-data';
import type { Sponsor, SponsorContact, SponsorSocialLink } from '../../types/sponsor';
import { Field, inputClass } from './fields';

export function SponsorsEditor({ data, onChange }: { data: TournamentData; onChange: (next: TournamentData) => void }) {
  const patch = (id: string, partial: Partial<Sponsor>) => {
    onChange({
      ...data,
      sponsors: data.sponsors.map((s) => (s.id === id ? { ...s, ...partial } : s)),
    });
  };

  if (data.sponsors.length === 0) return <p className="text-sm text-fg-muted">Nenhum patrocinador cadastrado.</p>;

  return (
    <div className="space-y-8">
      {data.sponsors.map((sponsor) => (
        <article key={sponsor.id} className="space-y-4 rounded-xl border border-line bg-ink-850/60 p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nome">
              <input className={inputClass} value={sponsor.name} onChange={(e) => patch(sponsor.id, { name: e.target.value })} />
            </Field>
            <Field label="Categoria">
              <input className={inputClass} value={sponsor.category} onChange={(e) => patch(sponsor.id, { category: e.target.value })} />
            </Field>
          </div>
          <Field label="Descrição">
            <textarea className={`${inputClass} min-h-24`} value={sponsor.description} onChange={(e) => patch(sponsor.id, { description: e.target.value })} />
          </Field>
          <Field label="Texto complementar">
            <textarea className={`${inputClass} min-h-20`} value={sponsor.about ?? ''} onChange={(e) => patch(sponsor.id, { about: e.target.value })} />
          </Field>
          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={sponsor.isActive} onChange={(e) => patch(sponsor.id, { isActive: e.target.checked })} />
              Ativo
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={sponsor.featured} onChange={(e) => patch(sponsor.id, { featured: e.target.checked })} />
              Destaque
            </label>
          </div>

          <div className="space-y-3">
            <p className="text-[0.68rem] font-semibold tracking-[0.14em] text-fg-dim uppercase">Serviços</p>
            {sponsor.services.map((service, i) => (
              <div key={service.id} className="grid gap-2 sm:grid-cols-2">
                <input
                  className={inputClass}
                  value={service.title}
                  onChange={(e) => {
                    const services = sponsor.services.map((s, idx) => (idx === i ? { ...s, title: e.target.value } : s));
                    patch(sponsor.id, { services });
                  }}
                />
                <input
                  className={inputClass}
                  value={service.description}
                  onChange={(e) => {
                    const services = sponsor.services.map((s, idx) => (idx === i ? { ...s, description: e.target.value } : s));
                    patch(sponsor.id, { services });
                  }}
                />
              </div>
            ))}
          </div>

          {sponsor.socialLinks.map((link, i) => (
            <div key={link.id} className="grid gap-2 sm:grid-cols-2">
              <Field label="Texto do botão">
                <input
                  className={inputClass}
                  value={link.label}
                  onChange={(e) => {
                    const socialLinks = sponsor.socialLinks.map((s, idx) => (idx === i ? { ...s, label: e.target.value } : s)) as SponsorSocialLink[];
                    patch(sponsor.id, { socialLinks });
                  }}
                />
              </Field>
              <Field label="URL">
                <input
                  className={inputClass}
                  value={link.url}
                  onChange={(e) => {
                    const socialLinks = sponsor.socialLinks.map((s, idx) => (idx === i ? { ...s, url: e.target.value } : s)) as SponsorSocialLink[];
                    patch(sponsor.id, { socialLinks });
                  }}
                />
              </Field>
            </div>
          ))}

          {sponsor.contactLinks.map((contact, i) =>
            contact.type === 'whatsapp' ? (
              <div key={contact.id} className="grid gap-2 sm:grid-cols-[1fr_auto]">
                <Field label="WhatsApp">
                  <input
                    className={inputClass}
                    value={contact.phone}
                    onChange={(e) => {
                      const contactLinks = sponsor.contactLinks.map((c, idx) => (idx === i ? { ...c, phone: e.target.value } : c)) as SponsorContact[];
                      patch(sponsor.id, { contactLinks });
                    }}
                  />
                </Field>
                <label className="mt-6 flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={contact.confirmed}
                    onChange={(e) => {
                      const contactLinks = sponsor.contactLinks.map((c, idx) => (idx === i ? { ...c, confirmed: e.target.checked } : c)) as SponsorContact[];
                      patch(sponsor.id, { contactLinks });
                    }}
                  />
                  Confirmado
                </label>
              </div>
            ) : (
              <Field key={contact.id} label="Link de contato">
                <input
                  className={inputClass}
                  value={contact.url}
                  onChange={(e) => {
                    const contactLinks = sponsor.contactLinks.map((c, idx) => (idx === i ? { ...c, url: e.target.value } : c)) as SponsorContact[];
                    patch(sponsor.id, { contactLinks });
                  }}
                />
              </Field>
            ),
          )}
        </article>
      ))}
    </div>
  );
}
