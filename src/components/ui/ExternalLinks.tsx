import { ArrowUpRight, Globe, Radio, Share2 } from 'lucide-react';
import { visibleLinks } from '../../lib/display';
import type { PublicLink } from '../../types/tournament';

const ICONS = { site: Globe, social: Share2, stream: Radio, other: Globe } as const;

/** Lista de links externos; links ausentes ou inválidos simplesmente não aparecem. */
export function ExternalLinks({ links, className = '' }: { links: readonly PublicLink[]; className?: string }) {
  const safe = visibleLinks(links);
  if (safe.length === 0) return null;
  return (
    <ul className={`flex flex-wrap gap-2 ${className}`}>
      {safe.map((link) => {
        const Icon = ICONS[link.kind ?? 'other'];
        return (
          <li key={`${link.label}-${link.url}`}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-lg border border-line bg-white/[0.03] px-3 py-2 text-sm text-fg-muted transition hover:border-accent/40 hover:text-fg"
            >
              <Icon className="size-4" aria-hidden="true" />
              {link.label}
              <ArrowUpRight className="size-3.5 opacity-60 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
              <span className="sr-only">(abre em nova aba)</span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
