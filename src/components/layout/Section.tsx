import type { ReactNode } from 'react';

interface SectionProps {
  id: string;
  title: string;
  description?: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Section({ id, title, description, aside, children, className = '' }: SectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-titulo`} className={`relative py-10 sm:py-14 ${className}`}>
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-5 sm:mb-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
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
