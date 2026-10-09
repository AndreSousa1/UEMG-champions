import type { ResolvedMatch, StageId } from '../types/tournament';
import { isWinnerSource, stageIndex } from './bracket';
import { stagesInUse } from './tournament-status';

export interface BracketNode {
  matchId: string;
  column: number;
  row: number;
}

/** Marcador de "entrada direta" para partidas sem confrontos anteriores fora da primeira coluna. */
export interface BracketBye {
  key: string;
  column: number;
  row: number;
  teamIds: string[];
  targetMatchId: string;
}

export interface BracketEdge {
  fromMatchId: string;
  toMatchId: string;
  toSlot: 1 | 2;
}

export interface BracketLayout {
  columns: StageId[];
  nodes: BracketNode[];
  byes: BracketBye[];
  edges: BracketEdge[];
  rowCount: number;
  finalMatchId: string | null;
}

/**
 * Posiciona as partidas em colunas (etapas) e linhas. As partidas sem
 * confronto anterior ocupam linhas em sequência; cada partida que recebe
 * vencedores fica centralizada entre suas partidas de origem.
 */
export function computeBracketLayout(matches: readonly ResolvedMatch[]): BracketLayout {
  const columns = stagesInUse(matches);
  const byId = new Map(matches.map((m) => [m.definition.id, m]));
  const rows = new Map<string, number>();
  const visiting = new Set<string>();
  let nextLeaf = 0;

  const childrenOf = (match: ResolvedMatch): ResolvedMatch[] =>
    match.slots
      .filter((slot) => slot.kind !== 'invalid' && isWinnerSource(slot.source))
      .map((slot) => byId.get((slot.source as { winnerOf: string }).winnerOf))
      .filter((m): m is ResolvedMatch => Boolean(m));

  const place = (match: ResolvedMatch): number => {
    const id = match.definition.id;
    const known = rows.get(id);
    if (known !== undefined) return known;
    visiting.add(id);
    const children = childrenOf(match).filter((c) => !visiting.has(c.definition.id) && !rows.has(c.definition.id));
    let row: number;
    if (children.length === 0) {
      row = nextLeaf++;
    } else {
      const childRows = children.map(place);
      row = (Math.min(...childRows) + Math.max(...childRows)) / 2;
    }
    visiting.delete(id);
    rows.set(id, row);
    return row;
  };

  const roots = matches
    .filter((m) => m.feedsInto === null)
    .sort((a, b) => stageIndex(b.definition.stage) - stageIndex(a.definition.stage));
  for (const root of roots) place(root);
  for (const match of matches) place(match);

  const nodes: BracketNode[] = matches.map((m) => ({
    matchId: m.definition.id,
    column: columns.indexOf(m.definition.stage),
    row: rows.get(m.definition.id) ?? 0,
  }));

  for (let column = 0; column < columns.length; column++) {
    const inColumn = nodes.filter((n) => n.column === column).sort((a, b) => a.row - b.row);
    for (let i = 1; i < inColumn.length; i++) {
      const prev = inColumn[i - 1]!;
      const current = inColumn[i]!;
      if (current.row < prev.row + 1) current.row = prev.row + 1;
    }
  }

  const minRow = Math.min(0, ...nodes.map((n) => n.row));
  for (const node of nodes) node.row -= minRow;

  const edges: BracketEdge[] = [];
  const byes: BracketBye[] = [];
  for (const match of matches) {
    match.slots.forEach((slot, index) => {
      if (slot.kind === 'invalid' || !isWinnerSource(slot.source)) return;
      if (!byId.has(slot.source.winnerOf)) return;
      edges.push({ fromMatchId: slot.source.winnerOf, toMatchId: match.definition.id, toSlot: (index + 1) as 1 | 2 });
    });
  }

  for (const node of nodes) {
    const match = byId.get(node.matchId)!;
    const directTeams = match.slots.flatMap((s) => ('team' in s.source ? [s.source.team] : []));
    const blocked = nodes.some((n) => n.column === node.column - 1 && Math.abs(n.row - node.row) < 1);
    if (node.column > 0 && directTeams.length === 2 && !blocked) {
      byes.push({ key: `bye-${node.matchId}`, column: node.column - 1, row: node.row, teamIds: directTeams, targetMatchId: node.matchId });
    }
  }

  const final = roots.length === 1 ? roots[0]! : null;
  const rowCount = nodes.length ? Math.max(...nodes.map((n) => n.row)) + 1 : 0;

  return { columns, nodes, byes, edges, rowCount, finalMatchId: final?.definition.id ?? null };
}
