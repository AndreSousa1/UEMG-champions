import { ChevronRight } from 'lucide-react';
import { matchWhen, seriesScore, slotView, teamVisibility } from '../../lib/display';
import { useSelection, useTournament } from '../../state/context';
import type { TeamDefinition } from '../../types/tournament';
import { MatchStatusBadge } from '../matches/MatchStatusBadge';
import { Dialog } from '../ui/Dialog';
import { ExternalLinks } from '../ui/ExternalLinks';
import { TeamAvatar } from './TeamAvatar';
import { TeamStatusBadge } from './TeamStatusBadge';

function TeamDetails({ team }: { team: TeamDefinition }) {
  const { model } = useTournament();
  const { openMatch } = useSelection();
  const { config } = model;
  const standing = model.standings.get(team.id);
  const visibility = teamVisibility(team, config);
  const campaign = model.matches.filter((m) => m.slots.some((s) => s.kind === 'team' && s.teamId === team.id));
  const entryStage = standing?.entryStage ? config.stages[standing.entryStage].label : null;

  return (
    <div className="space-y-7">
      <div className="flex items-center gap-4">
        <TeamAvatar team={team} size="xl" />
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {standing && <TeamStatusBadge standing={standing} />}
            <span className="chip">Vaga {team.id}</span>
          </div>
          {standing?.placement && <p className="font-display text-xl font-bold uppercase">{standing.placement}</p>}
          {entryStage && <p className="text-sm text-fg-muted">Estreia: {entryStage}</p>}
        </div>
      </div>

      {team.isPlaceholder && (
        <p className="rounded-lg border border-line bg-ink-850 px-4 py-3 text-sm text-fg-muted">
          Nome provisório. Os dados oficiais da equipe serão publicados pela organização.
        </p>
      )}

      {visibility.players && (
        <div>
          <h3 className="eyebrow mb-3">Elenco</h3>
          {team.players.length > 0 ? (
            <ol className="divide-y divide-line overflow-hidden rounded-xl border border-line">
              {team.players.map((player, i) => (
                <li key={`${player.nickname}-${i}`} className="flex items-center gap-4 bg-ink-850 px-4 py-3">
                  <span className="w-6 font-display text-sm font-bold text-fg-dim tabular">{String(i + 1).padStart(2, '0')}</span>
                  <span className="flex-1 font-semibold">{player.nickname}</span>
                  {visibility.level && player.level && <span className="chip">{player.level}</span>}
                </li>
              ))}
              {visibility.reserve && team.reserve && (
                <li className="flex items-center gap-4 bg-ink-900 px-4 py-3">
                  <span className="w-6 font-display text-sm font-bold text-fg-dim">RES</span>
                  <span className="flex-1 text-fg-muted">{team.reserve.nickname}</span>
                  {visibility.level && team.reserve.level && <span className="chip">{team.reserve.level}</span>}
                  <span className="chip">Reserva</span>
                </li>
              )}
            </ol>
          ) : (
            <p className="text-sm text-fg-dim italic">Elenco a ser divulgado pela organização.</p>
          )}
        </div>
      )}

      <div>
        <h3 className="eyebrow mb-3">Campanha</h3>
        {campaign.length === 0 ? (
          <p className="text-sm text-fg-muted">Nenhuma partida definida para esta equipe no momento.</p>
        ) : (
          <ul className="space-y-2">
            {campaign.map((match) => {
              const mySlot = match.slots.findIndex((s) => s.kind === 'team' && s.teamId === team.id);
              const opponent = slotView(match.slots[mySlot === 0 ? 1 : 0], model.teamsById);
              const score = seriesScore(match);
              const when = matchWhen(match, config);
              const won = match.winnerTeamId === team.id;
              const lost = match.loserTeamId === team.id;
              return (
                <li key={match.definition.id}>
                  <button
                    type="button"
                    onClick={() => openMatch(match.definition.id)}
                    className="flex w-full items-center gap-3 rounded-lg border border-line bg-ink-850 px-3.5 py-3 text-left text-sm transition hover:border-accent/40"
                  >
                    <span
                      className={`grid size-8 shrink-0 place-items-center rounded-md font-display font-bold ${
                        won ? 'bg-accent text-accent-ink' : lost ? 'bg-live/15 text-live' : 'bg-white/5 text-fg-dim'
                      }`}
                      aria-label={won ? 'Vitória' : lost ? 'Derrota' : 'A disputar'}
                    >
                      {won ? 'V' : lost ? 'D' : '–'}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate">
                        vs <span className="font-semibold">{opponent.kind === 'team' ? opponent.team.name : `${opponent.label} (${opponent.hint.toLowerCase()})`}</span>
                      </span>
                      <span className="block text-xs text-fg-dim">
                        {config.stages[match.definition.stage].label} · {match.definition.format}
                        {when && ` · ${when.dayMonth} ${when.time}`}
                      </span>
                    </span>
                    {score ? (
                      <span className="font-display text-lg font-bold tabular">
                        {score[mySlot]}–{score[mySlot === 0 ? 1 : 0]}
                      </span>
                    ) : (
                      <MatchStatusBadge state={match.state} />
                    )}
                    <ChevronRight className="size-4 text-fg-dim" aria-hidden="true" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {visibility.links && team.publicLinks.length > 0 && (
        <div>
          <h3 className="eyebrow mb-3">Links</h3>
          <ExternalLinks links={team.publicLinks} />
        </div>
      )}
    </div>
  );
}

export function TeamDialog() {
  const { model } = useTournament();
  const { selection, close } = useSelection();
  const team = selection?.type === 'team' ? model.teamsById.get(selection.id) : undefined;
  return (
    <Dialog open={Boolean(team)} onClose={close} eyebrow="Ficha da equipe" title={team?.name ?? ''}>
      {team && <TeamDetails key={team.id} team={team} />}
    </Dialog>
  );
}
