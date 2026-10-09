export const NAV_ITEMS = [
  { id: 'inicio', label: 'Visão geral' },
  { id: 'chaveamento', label: 'Chaveamento' },
  { id: 'partidas', label: 'Partidas' },
  { id: 'equipes', label: 'Equipes' },
  { id: 'formato', label: 'Formato' },
] as const;

export type NavItem = { id: string; label: string };

const SPONSORS_ITEM: NavItem = { id: 'patrocinadores', label: 'Patrocinadores' };

/** Itens do menu; "Patrocinadores" só aparece quando há patrocinador ativo. */
export function navItems(hasSponsors: boolean): readonly NavItem[] {
  if (!hasSponsors) return NAV_ITEMS;
  return NAV_ITEMS.flatMap((item) => (item.id === 'formato' ? [SPONSORS_ITEM, item] : [item]));
}
