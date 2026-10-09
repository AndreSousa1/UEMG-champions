import { slotAt, slotView } from '../../lib/display';
import { useTournament } from '../../state/context';
import type { ResolvedMatch } from '../../types/tournament';

function teamName(match: ResolvedMatch, slot: 1 | 2, teamsById: ReturnType<typeof useTournament>['model']['teamsById']) {
  const view = slotView(slotAt(match, slot), teamsById);
  return view.kind === 'team' ? view.team.shortName || view.team.name : `Equipe ${slot}`;
}

/** Chips compactos com o placar de cada mapa (usados na agenda). */
export function MapChips({ match, className = '' }: { match: ResolvedMatch; className?: string }) {
  const { model } = useTournament();
  if (match.result.kind !== 'decided' && match.result.kind !== 'partial') return null;
  if (match.state !== 'completed' && match.state !== 'live') return null;
  if (match.result.kind === 'decided' && match.result.walkover) {
    return <span className="chip">W.O. · {teamName(match, match.result.winner, model.teamsById)}</span>;
  }
  return (
    <ul className={`flex flex-wrap gap-1.5 ${className}`} aria-label="Placar por mapa">
      {match.result.maps.map((map) => (
        <li key={map.index} className="chip normal-case tracking-normal">
          <span className="text-fg-dim">M{map.index + 1}</span>
          {map.map && <span className="text-fg-muted">{map.map}</span>}
          {map.rounds ? (
            <span className="tabular">
              <span className={map.winner === 1 ? 'text-accent' : 'text-fg-dim'}>{map.rounds[0]}</span>
              <span className="text-fg-dim">–</span>
              <span className={map.winner === 2 ? 'text-accent' : 'text-fg-dim'}>{map.rounds[1]}</span>
            </span>
          ) : (
            <span className="text-accent">{teamName(match, map.winner, model.teamsById)}</span>
          )}
        </li>
      ))}
    </ul>
  );
}

/** Tabela completa de mapas (usada no modal da partida). */
export function MapTable({ match }: { match: ResolvedMatch }) {
  const { model } = useTournament();
  const result = match.result;
  const t1 = teamName(match, 1, model.teamsById);
  const t2 = teamName(match, 2, model.teamsById);

  if (result.kind === 'decided' && result.walkover) {
    return <p className="text-sm text-fg-muted">Vitória por W.O. de {teamName(match, result.winner, model.teamsById)}. Nenhum mapa disputado.</p>;
  }
  if ((result.kind !== 'decided' && result.kind !== 'partial') || (match.state !== 'completed' && match.state !== 'live')) {
    return (
      <p className="text-sm text-fg-muted">
        {match.state === 'invalid'
          ? 'O resultado cadastrado está em revisão e não é exibido.'
          : 'Nenhum mapa registrado. O placar aparecerá aqui quando a organização cadastrar o resultado.'}
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-line">
      <table className="w-full text-sm">
        <caption className="sr-only">Placar por mapa</caption>
        <thead className="bg-ink-850 text-[0.68rem] tracking-[0.14em] text-fg-dim uppercase">
          <tr>
            <th scope="col" className="px-3 py-2 text-left font-semibold">Mapa</th>
            <th scope="col" className="px-3 py-2 text-right font-semibold">{t1}</th>
            <th scope="col" className="px-3 py-2 text-left font-semibold">{t2}</th>
          </tr>
        </thead>
        <tbody>
          {result.maps.map((map) => (
            <tr key={map.index} className="border-t border-line">
              <th scope="row" className="px-3 py-2.5 text-left font-normal text-fg-muted">
                <span className="text-fg-dim">{map.index + 1}.</span> {map.map ?? 'Mapa não informado'}
              </th>
              <td className={`px-3 py-2.5 text-right font-display text-lg font-bold tabular ${map.winner === 1 ? 'text-accent' : 'text-fg-dim'}`}>
                {map.rounds ? map.rounds[0] : map.winner === 1 ? 'V' : 'D'}
              </td>
              <td className={`px-3 py-2.5 text-left font-display text-lg font-bold tabular ${map.winner === 2 ? 'text-accent' : 'text-fg-dim'}`}>
                {map.rounds ? map.rounds[1] : map.winner === 2 ? 'V' : 'D'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
