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
  return hasSponsors ? [...NAV_ITEMS, SPONSORS_ITEM] : NAV_ITEMS;
}
