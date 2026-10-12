import { ArrowUpRight, Radio } from 'lucide-react';

/** Abre a transmissão do dia em nova aba. Sem URL, não renderiza nada. */
export function WatchLiveButton({ href, className = 'btn btn-primary' }: { href: string | null; className?: string }) {
  if (!href) return null;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      <Radio className="size-4" aria-hidden="true" />
      Acompanhe a live
      <ArrowUpRight className="size-3.5 opacity-80" aria-hidden="true" />
      <span className="sr-only">(abre em nova aba)</span>
    </a>
  );
}
