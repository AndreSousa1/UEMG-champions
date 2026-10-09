import { useMemo } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useTypewriter } from '../../hooks/useTypewriter';
import { useTournament } from '../../state/context';

/** Nome dos patrocinadores ativos sendo escrito em loop, com link para a seção. */
export function SponsorTicker({ className = '' }: { className?: string }) {
  const { model } = useTournament();
  const reducedMotion = useReducedMotion();
  const names = useMemo(() => model.sponsors.map((s) => s.name), [model.sponsors]);
  const text = useTypewriter(names, !reducedMotion);
  if (names.length === 0) return null;

  const label = names.length === 1 ? 'Patrocínio' : 'Patrocinadores';

  return (
    <a
      href="#patrocinadores"
      className={`group inline-flex max-w-full items-baseline gap-3 rounded-sm ${className}`}
      aria-label={`${label}: ${names.join(', ')}. Ver patrocinadores`}
    >
      <span className="eyebrow shrink-0 text-fg-muted transition group-hover:text-fg">{label}</span>
      <span aria-hidden="true" className="h-px w-6 shrink-0 self-center bg-accent/50" />
      <span
        aria-hidden="true"
        className="min-w-0 truncate font-display text-[1.6rem] leading-tight font-bold tracking-wide text-fg uppercase transition group-hover:text-accent sm:text-[1.9rem]"
      >
        {text}
        <span className="ml-1 inline-block h-[0.85em] w-[0.12em] translate-y-[0.06em] animate-caret bg-accent" />
      </span>
    </a>
  );
}
