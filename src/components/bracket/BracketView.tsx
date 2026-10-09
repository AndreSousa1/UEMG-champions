import { ChevronLeft, ChevronRight, Trophy } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { computeBracketLayout, type BracketLayout } from '../../lib/bracket-layout';
import { dayLabel } from '../../lib/display';
import { useSelection, useTournament } from '../../state/context';
import type { ResolvedMatch, StageId } from '../../types/tournament';
import { TeamAvatar } from '../teams/TeamAvatar';
import { BracketMatchCard } from './BracketMatchCard';

const CARD_W = 232;
const CARD_H = 105;
const UNIT = 128;
const COL_GAP = 52;
const CHAMP_W = 184;
const COL_STEP = CARD_W + COL_GAP;
const SLOT_Y = [26 + 19, 26 + 38 + 1 + 19] as const;

function elbowPath(x1: number, y1: number, x2: number, y2: number): string {
  const mid = x1 + (x2 - x1) / 2;
  const dy = y2 - y1;
  if (Math.abs(dy) < 1) return `M${x1} ${y1} H${x2}`;
  const r = Math.min(8, Math.abs(dy) / 2, (x2 - x1) / 4);
  const dir = Math.sign(dy);
  return [
    `M${x1} ${y1}`,
    `H${mid - r}`,
    `Q${mid} ${y1} ${mid} ${y1 + dir * r}`,
    `V${y2 - dir * r}`,
    `Q${mid} ${y2} ${mid + r} ${y2}`,
    `H${x2}`,
  ].join(' ');
}

function stageHeader(stage: StageId, matches: readonly ResolvedMatch[], layoutConfig: ReturnType<typeof useTournament>['model']['config']) {
  const inStage = matches.filter((m) => m.definition.stage === stage);
  const dates = [...new Set(inStage.map((m) => m.definition.date))].sort();
  const formats = [...new Set(inStage.map((m) => m.definition.format))];
  const dayText = dates
    .map((d) => {
      const l = dayLabel(d, layoutConfig);
      return `${l.weekdayShort} ${l.dayMonth}`;
    })
    .join(' / ');
  return { label: layoutConfig.stages[stage].label, dayText, formats, count: inStage.length };
}

export function BracketView() {
  const { model } = useTournament();
  const { openTeam, openMatch } = useSelection();
  const { config } = model;
  const layout: BracketLayout = useMemo(() => computeBracketLayout(model.matches), [model.matches]);
  const scroller = useRef<HTMLDivElement>(null);
  const [hoveredTeam, setHoveredTeam] = useState<string | null>(null);
  const [activeColumn, setActiveColumn] = useState(0);
  const [edges, setEdges] = useState({ left: false, right: false });

  const columnCount = layout.columns.length + 1;
  const width = layout.columns.length * COL_STEP + CHAMP_W;
  const height = Math.max(CARD_H, (layout.rowCount - 1) * UNIT + CARD_H);
  const nodeById = useMemo(() => new Map(layout.nodes.map((n) => [n.matchId, n])), [layout.nodes]);

  const updateScrollState = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    setActiveColumn(Math.min(columnCount - 1, Math.round(el.scrollLeft / COL_STEP)));
    setEdges({ left: el.scrollLeft > 4, right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 });
  }, [columnCount]);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const frame = requestAnimationFrame(updateScrollState);
    el.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [updateScrollState]);

  const pillBar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const bar = pillBar.current;
    const pill = bar?.children[activeColumn] as HTMLElement | undefined;
    if (!bar || !pill) return;
    if (pill.offsetLeft < bar.scrollLeft || pill.offsetLeft + pill.offsetWidth > bar.scrollLeft + bar.clientWidth) {
      bar.scrollTo({ left: pill.offsetLeft - 8 });
    }
  }, [activeColumn]);

  const scrollToColumn = (index: number) => {
    const el = scroller.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(columnCount - 1, index));
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollTo({ left: clamped * COL_STEP, behavior: reduce ? 'auto' : 'smooth' });
  };

  const finalNode = layout.finalMatchId ? nodeById.get(layout.finalMatchId) : undefined;
  const finalMatch = layout.finalMatchId ? model.matchesById.get(layout.finalMatchId) : undefined;
  const champion = model.champion ? model.teamsById.get(model.champion.championId) : undefined;
  const champX = layout.columns.length * COL_STEP;
  const champY = finalNode ? finalNode.row * UNIT : 0;

  const columnLabels = [
    ...layout.columns.map((s) => config.stages[s].shortLabel),
    'Campeão',
  ];

  return (
    <div>
      {/* Navegação entre fases (útil principalmente no celular) */}
      <div className="mb-4 flex items-center gap-2">
        <div ref={pillBar} className="relative flex flex-1 gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]" role="group" aria-label="Ir para a fase">
          {columnLabels.map((label, i) => (
            <button
              key={label}
              type="button"
              onClick={() => scrollToColumn(i)}
              aria-current={activeColumn === i ? 'step' : undefined}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 font-display text-sm font-semibold tracking-[0.1em] uppercase transition ${
                activeColumn === i ? 'border-accent/50 bg-accent/10 text-accent' : 'border-line text-fg-muted hover:text-fg'
              }`}
            >
              <span className="mr-1.5 text-fg-dim tabular">{i + 1}</span>
              {label}
            </button>
          ))}
        </div>
        <div className="flex shrink-0 gap-1.5">
          <button
            type="button"
            onClick={() => scrollToColumn(activeColumn - 1)}
            disabled={!edges.left}
            aria-label="Fase anterior"
            className="grid size-9 place-items-center rounded-full border border-line text-fg-muted transition hover:text-fg disabled:opacity-30"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollToColumn(activeColumn + 1)}
            disabled={!edges.right}
            aria-label="Próxima fase"
            className="grid size-9 place-items-center rounded-full border border-line text-fg-muted transition hover:text-fg disabled:opacity-30"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <div className="relative">
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-ink-950 to-transparent transition-opacity ${edges.left ? 'opacity-100' : 'opacity-0'}`}
        />
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-y-0 right-0 z-10 w-14 bg-gradient-to-l from-ink-950 to-transparent transition-opacity ${edges.right ? 'opacity-100' : 'opacity-0'}`}
        />

        <div
          ref={scroller}
          className="scrollbar-thin overflow-x-auto overscroll-x-contain pb-4 max-lg:snap-x max-lg:snap-mandatory"
          tabIndex={0}
          role="region"
          aria-label="Chaveamento. Role horizontalmente para ver todas as fases."
        >
          <div style={{ width }} className="relative">
            {/* Cabeçalhos das colunas */}
            <div className="relative mb-5 h-[58px]">
              {layout.columns.map((stage, i) => {
                const header = stageHeader(stage, model.matches, config);
                return (
                  <div key={stage} className="absolute top-0 snap-start scroll-ml-4" style={{ left: i * COL_STEP, width: CARD_W }}>
                    <div className="flex items-center gap-2">
                      <span className="font-display text-[1.05rem] font-bold tracking-[0.1em] text-fg uppercase">{header.label}</span>
                      {header.formats.map((f) => (
                        <span key={f} className="chip px-1.5 py-0 text-accent">
                          {f}
                        </span>
                      ))}
                    </div>
                    <div className="mt-1 text-[0.72rem] font-semibold tracking-[0.12em] text-fg-dim uppercase">
                      {header.dayText} · {header.count} {header.count === 1 ? 'partida' : 'partidas'}
                    </div>
                    <div className="mt-2.5 h-px bg-gradient-to-r from-line-strong to-transparent" />
                  </div>
                );
              })}
              <div className="absolute top-0 snap-start scroll-ml-4" style={{ left: champX, width: CHAMP_W }}>
                <span className="font-display text-[1.05rem] font-bold tracking-[0.1em] text-gold uppercase">Campeão</span>
                <div className="mt-1 text-[0.72rem] font-semibold tracking-[0.12em] text-fg-dim uppercase">
                  {finalMatch ? (() => {
                    const l = dayLabel(finalMatch.definition.date, config);
                    return `${l.weekdayShort} ${l.dayMonth}`;
                  })() : '—'}
                </div>
                <div className="mt-2.5 h-px bg-gradient-to-r from-gold/40 to-transparent" />
              </div>
            </div>

            {/* Área do chaveamento */}
            <div className="relative" style={{ height }}>
              <svg className="absolute inset-0 overflow-visible" width={width} height={height} aria-hidden="true">
                {layout.edges.map((edge) => {
                  const from = nodeById.get(edge.fromMatchId);
                  const to = nodeById.get(edge.toMatchId);
                  const source = model.matchesById.get(edge.fromMatchId);
                  if (!from || !to || !source) return null;
                  const x1 = from.column * COL_STEP + CARD_W;
                  const y1 = from.row * UNIT + CARD_H / 2;
                  const x2 = to.column * COL_STEP;
                  const y2 = to.row * UNIT + (edge.toSlot === 1 ? SLOT_Y[0] : SLOT_Y[1]);
                  const decided = Boolean(source.winnerTeamId);
                  const hovered = hoveredTeam !== null && source.winnerTeamId === hoveredTeam;
                  return (
                    <path
                      key={`${edge.fromMatchId}-${edge.toMatchId}`}
                      d={elbowPath(x1, y1, x2, y2)}
                      fill="none"
                      strokeWidth={hovered ? 2.5 : 1.5}
                      className={`transition-[stroke] duration-200 ${hovered ? 'stroke-accent' : decided ? 'stroke-accent/60' : 'stroke-ink-500'}`}
                    />
                  );
                })}
                {layout.byes.map((bye) => {
                  const to = nodeById.get(bye.targetMatchId);
                  if (!to) return null;
                  const x1 = bye.column * COL_STEP + CARD_W;
                  const y = bye.row * UNIT + CARD_H / 2;
                  return (
                    <path
                      key={bye.key}
                      d={`M${x1} ${y} H${to.column * COL_STEP}`}
                      fill="none"
                      strokeWidth={1.5}
                      strokeDasharray="3 5"
                      className="stroke-ink-500"
                    />
                  );
                })}
                {finalNode && (
                  <path
                    d={`M${finalNode.column * COL_STEP + CARD_W} ${champY + CARD_H / 2} H${champX}`}
                    fill="none"
                    strokeWidth={1.5}
                    className={champion ? 'stroke-gold/70' : 'stroke-ink-500'}
                  />
                )}
              </svg>

              {layout.byes.map((bye) => (
                <div
                  key={bye.key}
                  className="absolute flex flex-col justify-center rounded-lg border border-dashed border-line-strong bg-ink-900/40 px-3"
                  style={{ left: bye.column * COL_STEP, top: bye.row * UNIT + 10, width: CARD_W, height: CARD_H - 20 }}
                >
                  <span className="text-[0.66rem] font-semibold tracking-[0.16em] text-fg-dim uppercase">Entrada direta</span>
                  <span className="mt-1 flex flex-wrap gap-x-1.5 text-sm text-fg-muted">
                    {bye.teamIds.map((id, i) => {
                      const team = model.teamsById.get(id);
                      return (
                        <span key={id}>
                          <button type="button" onClick={() => openTeam(id)} className="hover:text-accent">
                            {team?.name ?? id}
                          </button>
                          {i < bye.teamIds.length - 1 && <span className="ml-1.5 text-fg-dim">e</span>}
                        </span>
                      );
                    })}
                  </span>
                  <span className="text-[0.72rem] text-fg-dim">
                    estreiam em {config.stages[layout.columns[bye.column + 1] ?? 'quarterfinal'].label.toLowerCase()}
                  </span>
                </div>
              ))}

              {layout.nodes.map((node) => {
                const match = model.matchesById.get(node.matchId);
                if (!match) return null;
                return (
                  <BracketMatchCard
                    key={node.matchId}
                    match={match}
                    hoveredTeam={hoveredTeam}
                    onHoverTeam={setHoveredTeam}
                    style={{ left: node.column * COL_STEP, top: node.row * UNIT, width: CARD_W, height: CARD_H }}
                  />
                );
              })}

              {finalNode && (
                <div className="absolute" style={{ left: champX, top: champY, width: CHAMP_W, height: CARD_H }}>
                  {champion ? (
                    <button
                      type="button"
                      onClick={() => openTeam(champion.id)}
                      className="flex h-full w-full items-center gap-3 rounded-lg border border-gold/50 bg-gradient-to-br from-gold/15 to-transparent px-3.5 text-left shadow-[0_0_40px_-12px_var(--color-gold)] transition hover:border-gold"
                    >
                      <TeamAvatar team={champion} size="md" />
                      <span className="min-w-0">
                        <span className="flex items-center gap-1 text-[0.66rem] font-semibold tracking-[0.16em] text-gold uppercase">
                          <Trophy className="size-3" aria-hidden="true" /> Campeã
                        </span>
                        <span className="block truncate font-display text-xl font-bold uppercase" title={champion.name}>
                          {champion.name}
                        </span>
                      </span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => finalMatch && openMatch(finalMatch.definition.id)}
                      className="flex h-full w-full flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-gold/30 bg-ink-900/40 text-center transition hover:border-gold/60"
                    >
                      <Trophy className="size-6 text-gold/60" aria-hidden="true" />
                      <span className="font-display text-base font-bold tracking-[0.1em] text-fg-muted uppercase">A definir</span>
                      <span className="text-[0.7rem] text-fg-dim">Vencedor da {finalMatch?.definition.id ?? 'final'}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
