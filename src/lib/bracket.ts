import type {
  MatchDefinition,
  MatchState,
  ResolvedMatch,
  ResolvedSlot,
  ScheduledSlot,
  SlotSource,
  StageId,
  TeamDefinition,
  ValidationIssue,
} from '../types/tournament';
import { evaluateResult } from './results';

export const STAGE_ORDER: readonly StageId[] = ['preliminary', 'quarterfinal', 'semifinal', 'final'];

export function stageIndex(stage: StageId): number {
  return STAGE_ORDER.indexOf(stage);
}

type SlotNumber = 1 | 2;
type SlotKey = `${string}#${SlotNumber}`;

const slotKey = (matchId: string, slot: SlotNumber): SlotKey => `${matchId}#${slot}`;

function sourceOf(match: MatchDefinition, slot: SlotNumber): SlotSource {
  return slot === 1 ? match.team1 : match.team2;
}

export function isWinnerSource(source: SlotSource): source is { winnerOf: string } {
  return 'winnerOf' in source;
}

/**
 * Valida a estrutura do chaveamento e devolve, para cada vaga com problema,
 * o motivo. Vagas inválidas nunca recebem equipe, o que mantém a interface
 * em um estado seguro.
 */
function analyzeStructure(teams: readonly TeamDefinition[], matches: readonly MatchDefinition[]) {
  const issues: ValidationIssue[] = [];
  const invalidSlots = new Map<SlotKey, string>();
  const teamIds = new Set(teams.map((t) => t.id));
  const byId = new Map<string, MatchDefinition>();
  const unique: MatchDefinition[] = [];

  for (const match of matches) {
    if (byId.has(match.id)) {
      issues.push({ severity: 'error', matchId: match.id, message: `ID de partida duplicado: ${match.id}. Apenas a primeira ocorrência é considerada.` });
      continue;
    }
    byId.set(match.id, match);
    unique.push(match);
  }

  const teamUses = new Map<string, SlotKey[]>();
  const winnerUses = new Map<string, SlotKey[]>();

  for (const match of unique) {
    if (!STAGE_ORDER.includes(match.stage)) {
      issues.push({ severity: 'error', matchId: match.id, message: `${match.id}: etapa desconhecida "${String(match.stage)}".` });
    }
    for (const slot of [1, 2] as const) {
      const source = sourceOf(match, slot);
      const key = slotKey(match.id, slot);
      if (isWinnerSource(source)) {
        const origin = byId.get(source.winnerOf);
        if (!origin) {
          invalidSlots.set(key, `Partida de origem ${source.winnerOf} não existe.`);
        } else if (source.winnerOf === match.id) {
          invalidSlots.set(key, `${match.id} não pode depender de si mesma.`);
        } else if (stageIndex(origin.stage) >= stageIndex(match.stage)) {
          invalidSlots.set(key, `${source.winnerOf} precisa ser de uma etapa anterior a ${match.id}.`);
        }
        const uses = winnerUses.get(source.winnerOf) ?? [];
        uses.push(key);
        winnerUses.set(source.winnerOf, uses);
      } else {
        if (!teamIds.has(source.team)) {
          invalidSlots.set(key, `Equipe ${source.team} não está cadastrada.`);
        }
        const uses = teamUses.get(source.team) ?? [];
        uses.push(key);
        teamUses.set(source.team, uses);
      }
    }
  }

  for (const [teamId, uses] of teamUses) {
    if (uses.length > 1) {
      const where = uses.map((u) => u.replace('#', ' vaga ')).join(', ');
      issues.push({ severity: 'error', teamId, message: `Equipe ${teamId} foi colocada em mais de uma vaga (${where}).` });
      for (const key of uses) invalidSlots.set(key, `Equipe ${teamId} aparece em mais de uma vaga.`);
    }
  }

  for (const [originId, uses] of winnerUses) {
    if (uses.length > 1) {
      const where = uses.map((u) => u.replace('#', ' vaga ')).join(', ');
      issues.push({ severity: 'error', matchId: originId, message: `O vencedor de ${originId} foi colocado em mais de uma vaga (${where}).` });
      for (const key of uses) invalidSlots.set(key, `Vencedor de ${originId} aparece em mais de uma vaga.`);
    }
  }

  for (const [key, reason] of invalidSlots) {
    const [matchId] = key.split('#');
    if (!issues.some((i) => i.message.includes(reason))) {
      issues.push({ severity: 'error', matchId, message: `${matchId}: ${reason}` });
    }
  }

  const roots = unique.filter((m) => !winnerUses.has(m.id));
  if (roots.length !== 1) {
    issues.push({
      severity: 'warning',
      message: `O chaveamento deveria terminar em uma única final, mas há ${roots.length} partidas cujo vencedor não avança (${roots.map((r) => r.id).join(', ')}).`,
    });
  }

  return { issues, invalidSlots, unique, winnerUses };
}

function describeSlot(slot: ResolvedSlot): string | null {
  if (slot.kind === 'pending') return `aguarda o vencedor de ${slot.source.winnerOf}`;
  if (slot.kind === 'invalid') return slot.reason;
  return null;
}

/**
 * Resolve o chaveamento: identifica vencedores, preenche as vagas seguintes
 * e define o estado de cada partida. Partidas são processadas por etapa,
 * portanto a origem de uma vaga sempre é resolvida antes do destino.
 */
export function resolveBracket(
  teams: readonly TeamDefinition[],
  matches: readonly MatchDefinition[],
  schedule: ReadonlyMap<string, ScheduledSlot>,
): { matches: ResolvedMatch[]; issues: ValidationIssue[] } {
  const { issues, invalidSlots, unique, winnerUses } = analyzeStructure(teams, matches);
  const resolved = new Map<string, ResolvedMatch>();

  const ordered = [...unique].sort(
    (a, b) => stageIndex(a.stage) - stageIndex(b.stage) || a.date.localeCompare(b.date) || a.order - b.order,
  );

  for (const match of ordered) {
    const slots = ([1, 2] as const).map((slot): ResolvedSlot => {
      const source = sourceOf(match, slot);
      const invalidReason = invalidSlots.get(slotKey(match.id, slot));
      if (invalidReason) return { kind: 'invalid', source, reason: invalidReason };
      if (!isWinnerSource(source)) return { kind: 'team', teamId: source.team, source };
      const origin = resolved.get(source.winnerOf);
      if (origin?.winnerTeamId) return { kind: 'team', teamId: origin.winnerTeamId, source };
      return { kind: 'pending', source };
    }) as [ResolvedSlot, ResolvedSlot];

    const result = evaluateResult(match);
    const problems: string[] = [];
    let state: MatchState;
    let winnerSlot: 1 | 2 | null = null;

    const bothTeams = slots[0].kind === 'team' && slots[1].kind === 'team';
    const hasInvalidSlot = slots.some((s) => s.kind === 'invalid');
    const sameTeam = bothTeams && slots[0].kind === 'team' && slots[1].kind === 'team' && slots[0].teamId === slots[1].teamId;

    if (hasInvalidSlot || sameTeam) {
      state = 'invalid';
      if (sameTeam) problems.push('A mesma equipe ocupa as duas vagas.');
    } else if (result.kind === 'invalid') {
      state = 'invalid';
      problems.push(result.reason);
    } else if (match.status === 'completed') {
      if (!bothTeams) {
        state = 'invalid';
        const pending = slots.map(describeSlot).filter(Boolean).join('; ');
        problems.push(`Marcada como encerrada, mas os participantes ainda não estão definidos (${pending}).`);
      } else if (result.kind !== 'decided') {
        state = 'invalid';
        problems.push(
          result.kind === 'none'
            ? 'Marcada como encerrada, mas nenhum mapa foi cadastrado.'
            : `Marcada como encerrada, mas a série ${match.format} ainda não tem vencedor (${result.mapWins[0]}–${result.mapWins[1]}).`,
        );
      } else {
        state = 'completed';
        winnerSlot = result.winner;
      }
    } else if (match.status === 'live') {
      if (!bothTeams) {
        state = 'invalid';
        problems.push('Marcada como ao vivo, mas os participantes ainda não estão definidos.');
      } else {
        state = 'live';
        if (result.kind === 'decided') {
          problems.push('O resultado já decide a série; altere o status para "completed" para que o vencedor avance.');
        }
      }
    } else {
      state = match.status === 'postponed' ? 'postponed' : 'scheduled';
      if (result.kind === 'partial' || result.kind === 'decided') {
        problems.push('Há mapas cadastrados, mas o status não é "live" nem "completed"; o resultado não é considerado.');
      }
    }

    const winnerTeam = winnerSlot ? slots[winnerSlot - 1] : null;
    const loserTeam = winnerSlot ? slots[winnerSlot === 1 ? 1 : 0] : null;
    const consumers = winnerUses.get(match.id) ?? [];
    let feedsInto: ResolvedMatch['feedsInto'] = null;
    if (consumers.length === 1) {
      const [targetId, slot] = consumers[0]!.split('#');
      feedsInto = { matchId: targetId!, slot: Number(slot) as 1 | 2 };
    }

    for (const message of problems) {
      issues.push({ severity: state === 'invalid' ? 'error' : 'warning', matchId: match.id, message: `${match.id}: ${message}` });
    }

    resolved.set(match.id, {
      definition: match,
      slots,
      schedule: schedule.get(match.id) ?? null,
      result,
      state,
      winnerSlot,
      winnerTeamId: winnerTeam?.kind === 'team' ? winnerTeam.teamId : null,
      loserTeamId: loserTeam?.kind === 'team' ? loserTeam.teamId : null,
      feedsInto,
      problems,
    });
  }

  return { matches: [...resolved.values()], issues };
}

/** Partida final: aquela cujo vencedor não avança para nenhuma outra. */
export function findFinalMatch(matches: readonly ResolvedMatch[]): ResolvedMatch | null {
  const roots = matches.filter((m) => m.feedsInto === null);
  if (roots.length !== 1) return null;
  return roots[0] ?? null;
}
