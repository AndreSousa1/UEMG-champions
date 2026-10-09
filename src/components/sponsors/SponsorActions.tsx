import { ArrowUpRight } from 'lucide-react';
import { resolveContact, visibleSocialLinks } from '../../lib/sponsors';
import type { Sponsor } from '../../types/sponsor';
import { CONTACT_ICONS, SOCIAL_ICONS } from './sponsor-icons';

interface Action {
  key: string;
  label: string;
  href: string;
  hint?: string;
  Icon: (typeof SOCIAL_ICONS)[keyof typeof SOCIAL_ICONS];
}

/** Botões de redes e contatos válidos; o primeiro recebe o destaque principal. */
export function SponsorActions({ sponsor, compact = false }: { sponsor: Sponsor; compact?: boolean }) {
  const actions: Action[] = [
    ...visibleSocialLinks(sponsor.socialLinks).map((l) => ({
      key: `social-${l.id}`,
      label: l.label,
      href: l.url,
      hint: l.handle,
      Icon: SOCIAL_ICONS[l.network],
    })),
    ...sponsor.contactLinks.flatMap((c) => {
      const resolved = resolveContact(c);
      return resolved ? [{ key: `contact-${resolved.id}`, label: resolved.label, href: resolved.href, Icon: CONTACT_ICONS[resolved.kind] }] : [];
    }),
  ];
  if (actions.length === 0) return null;

  return (
    <ul className="flex flex-wrap items-center gap-3" aria-label={`Canais da ${sponsor.name}`}>
      {actions.map(({ key, label, href, hint, Icon }, i) => (
        <li key={key} className="flex items-center gap-3">
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`btn ${i === 0 ? 'btn-primary' : 'btn-ghost'} ${compact ? 'px-4 py-2.5 text-[0.85rem]' : ''}`}
          >
            <Icon className="size-4" aria-hidden="true" />
            {label}
            <ArrowUpRight className="size-3.5 opacity-70" aria-hidden="true" />
            <span className="sr-only">(abre em nova aba)</span>
          </a>
          {hint && !compact && <span className="text-sm font-semibold text-fg-muted">{hint}</span>}
        </li>
      ))}
    </ul>
  );
}
