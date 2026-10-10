import { ArrowUpRight } from 'lucide-react';
import { matchWhen, slotView, teamVisibility } from '../../lib/display';
import { useSelection, useTournament } from '../../state/context';
import type { TeamDefinition } from '../../types/tournament';
import { TeamAvatar } from './TeamAvatar';
import { TeamStatusBadge } from './TeamStatusBadge';

function useNextMatchSummary(teamId: string) {
  const { model } = useTournament();
  const standing = model.standings.get(teamId);
  if (!standing?.nextMatchId) return null;
  const match = model.matchesById.get(standing.nextMatchId);
  if (!match) return null;
  const opponentSlot = match.slots.find((s) => !(s.kind === 'team' && s.teamId === teamId));
  const opponent = opponentSlot ? slotView(opponentSlot, model.teamsById) : null;
  return {
    match,
    when: matchWhen(match, model.config),
    opponent: opponent?.kind === 'team' ? opponent.team.name : opponent ? `${opponent.label} (${opponent.hint.toLowerCase()})` : 'A definir',
  };
}

export function TeamCard({ team }: { team: TeamDefinition }) {
  const { model } = useTournament();
  const { openTeam } = useSelection();
  const standing = model.standings.get(team.id);
  const visibility = teamVisibility(team, model.config);
  const next = useNextMatchSummary(team.id);
  const eliminated = standing?.status === 'eliminated';
  const isChampion = standing?.status === 'champion';

  return (
    <li>
      <button
        type="button"
        onClick={() => openTeam(team.id)}
        aria-label={`Ver ficha de ${team.name}`}
        className={`group relative flex h-full w-full flex-col overflow-hidden rounded-xl border bg-ink-850 p-5 text-left transition duration-200 hover:-translate-y-1 hover:border-accent/40 hover:bg-ink-800 ${
          isChampion ? 'border-gold/50' : 'border-line'
        } ${eliminated ? 'opacity-75 hover:opacity-100' : ''}`}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-6 -right-2 font-display text-[7rem] leading-none font-extrabold text-white/[0.025] transition group-hover:text-accent/[0.06]"
        >
          {team.id}
        </span>

        <div className="relative flex items-start justify-between gap-3">
          <TeamAvatar team={team} size="card" dimmed={eliminated} />
          {standing && <TeamStatusBadge standing={standing} />}
        </div>

        <div className="relative mt-4">
          <h3 className="truncate font-display text-2xl font-bold uppercase" title={team.name}>
            {team.name}
          </h3>
        </div>

        <div className="relative mt-4 min-h-[3.25rem] border-t border-line pt-3 text-sm">
          {visibility.players && team.players.length > 0 ? (
            <p className="leading-relaxed text-fg-muted">
              {team.players.map((p) => p.nickname).join(' · ')}
              {visibility.reserve && team.reserve && <span className="text-fg-dim"> · {team.reserve.nickname} (res.)</span>}
            </p>
          ) : (
            <p className="text-fg-dim italic">{visibility.players ? 'Elenco a ser divulgado pela organização' : 'Elenco não divulgado'}</p>
          )}
        </div>

        <div className="relative mt-auto flex items-end justify-between gap-3 pt-4 text-xs">
          <span className="min-w-0 text-fg-muted">
            {standing?.placement ? (
              <>
                <span className="block text-[0.64rem] font-semibold tracking-[0.16em] text-fg-dim uppercase">Colocação</span>
                <span className="font-semibold text-fg">{standing.placement}</span>
              </>
            ) : next ? (
              <>
                <span className="block text-[0.64rem] font-semibold tracking-[0.16em] text-fg-dim uppercase">
                  Próxima · {model.config.stages[next.match.definition.stage].shortLabel}
                </span>
                <span className="block truncate">
                  {next.when && <span className="font-semibold text-fg tabular">{next.when.dayMonth} {next.when.time}</span>} vs {next.opponent}
                </span>
              </>
            ) : null}
          </span>
          <ArrowUpRight className="size-4 shrink-0 text-fg-dim transition group-hover:text-accent" aria-hidden="true" />
        </div>
      </button>
    </li>
  );
}
