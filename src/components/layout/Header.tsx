import { Menu, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useTournament } from '../../state/context';
import { Logo } from '../brand/Logo';
import { navItems } from './nav';

function useActiveSection(ids: readonly string[]): string {
  const [active, setActive] = useState<string>(ids[0] ?? '');
  useEffect(() => {
    const elements = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => Boolean(el));
    if (elements.length === 0 || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-35% 0px -55% 0px' },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids]);
  return active;
}

export function Header() {
  const { model } = useTournament();
  const items = useMemo(() => navItems(model.sponsors.length > 0), [model.sponsors.length]);
  const sectionIds = useMemo(() => items.map((item) => item.id), [items]);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(() => typeof window !== 'undefined' && window.scrollY > 8);
  const active = useActiveSection(sectionIds);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-50 h-[var(--header-h)] border-b transition-colors duration-300 ${
        scrolled || open ? 'border-line bg-ink-950/85 backdrop-blur-xl' : 'border-transparent bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <a href="#inicio" className="flex shrink-0 items-center" aria-label="UEMG champions — início" onClick={() => setOpen(false)}>
          <Logo placement="header" />
        </a>

        <nav aria-label="Seções" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {items.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  aria-current={active === item.id ? 'location' : undefined}
                  className={`relative block px-3 py-2 whitespace-nowrap font-display text-[0.92rem] font-semibold tracking-[0.14em] uppercase transition-colors ${
                    active === item.id ? 'text-fg' : 'text-fg-dim hover:text-fg'
                  }`}
                >
                  {item.label}
                  <span
                    aria-hidden="true"
                    className={`absolute inset-x-3 -bottom-px h-0.5 origin-left bg-accent transition-transform duration-300 ${
                      active === item.id ? 'scale-x-100' : 'scale-x-0'
                    }`}
                  />
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <button
          type="button"
          className="-mr-2 rounded-lg p-2 text-fg lg:hidden"
          aria-expanded={open}
          aria-controls="menu-mobile"
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      <nav
        id="menu-mobile"
        aria-label="Seções"
        hidden={!open}
        className="border-b border-line bg-ink-950/95 backdrop-blur-xl lg:hidden"
      >
        <ul className="mx-auto flex max-w-7xl flex-col px-4 py-3">
          {items.map((item, i) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={() => setOpen(false)}
                aria-current={active === item.id ? 'location' : undefined}
                className={`flex items-center gap-4 border-b border-line py-3.5 font-display text-lg font-bold tracking-[0.12em] uppercase last:border-0 ${
                  active === item.id ? 'text-accent' : 'text-fg'
                }`}
              >
                <span className="w-6 text-sm text-fg-dim tabular">{String(i + 1).padStart(2, '0')}</span>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
