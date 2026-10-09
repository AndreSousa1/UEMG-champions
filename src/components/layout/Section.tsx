import type { ReactNode } from 'react';

interface SectionProps {
  id: string;
  index: string;
  eyebrow: string;
  title: string;
  description?: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Section({ id, index, eyebrow, title, description, aside, children, className = '' }: SectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-titulo`} className={`relative py-16 sm:py-24 ${className}`}>
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-5 sm:mb-12 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 flex items-center gap-3">
              <span className="font-display text-sm font-bold text-accent tabular">{index}</span>
              <span className="h-px w-8 bg-accent/50" aria-hidden="true" />
              <span className="eyebrow">{eyebrow}</span>
            </div>
            <h2
              id={`${id}-titulo`}
              className="font-display text-[clamp(2.2rem,5vw,3.6rem)] leading-[0.95] font-extrabold tracking-tight uppercase"
            >
              {title}
            </h2>
            {description && <p className="mt-4 max-w-xl text-[0.98rem] leading-relaxed text-fg-muted">{description}</p>}
          </div>
          {aside && <div className="shrink-0">{aside}</div>}
        </div>
        {children}
      </div>
    </section>
  );
}
