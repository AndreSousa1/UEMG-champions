import type { ReactNode } from 'react';

export const inputClass =
  'w-full rounded-lg border border-line bg-ink-850 px-3 py-2 text-sm text-fg outline-none focus:border-accent';

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1 block text-[0.68rem] font-semibold tracking-[0.14em] text-fg-dim uppercase">{label}</span>
      {children}
    </label>
  );
}
