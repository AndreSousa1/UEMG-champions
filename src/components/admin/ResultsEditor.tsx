import { useMemo, useState } from 'react';
import type { TournamentData } from '../../lib/tournament-data';
import type { MapResult, MatchStatus, SlotSource } from '../../types/tournament';
import { Field, inputClass } from './fields';

function slotLabel(data: TournamentData, source: SlotSource): string {
  if ('team' in source) return data.teams.find((t) => t.id === source.team)?.name ?? source.team;
  return `Vencedor de ${source.winnerOf}`;
}

function emptyMaps(format: 'MD1' | 'MD3'): MapResult[] {
  const slots = format === 'MD1' ? 1 : 3;
  return Array.from({ length: slots }, () => ({ map: '', rounds: [0, 0] as [number, number] }));
}

function isBlankMap(row: MapResult): boolean {
  const [a, b] = row.rounds ?? [0, 0];
  return !row.map?.trim() && a === 0 && b === 0 && row.winner === undefined;
}

function persistMaps(rows: MapResult[]): MapResult[] {
  let last = -1;
  rows.forEach((row, i) => {
    if (!isBlankMap(row)) last = i;
  });
  if (last < 0) return [];
  return rows.slice(0, last + 1).map((row) => ({
    map: row.map?.trim() || undefined,
    rounds: row.rounds,
  }));
}

export function ResultsEditor({ data, onChange }: { data: TournamentData; onChange: (next: TournamentData) => void }) {
  const [matchId, setMatchId] = useState(data.matches[0]?.id ?? '');
  const match = useMemo(() => data.matches.find((m) => m.id === matchId) ?? data.matches[0], [data.matches, matchId]);
  if (!match) return <p className="text-sm text-fg-muted">Nenhuma partida cadastrada.</p>;

  const maps = emptyMaps(match.format).map((slot, i) => match.maps?.[i] ?? slot);

  const patch = (partial: Partial<typeof match>) => {
    onChange({
      ...data,
      matches: data.matches.map((m) => (m.id === match.id ? { ...m, ...partial } : m)),
    });
  };

  const setMap = (index: number, next: MapResult) => {
    const list = maps.map((row, i) => (i === index ? next : row));
    patch({ maps: persistMaps(list) });
  };

  return (
    <div className="space-y-5">
      <Field label="Partida">
        <select className={inputClass} value={match.id} onChange={(e) => setMatchId(e.target.value)}>
          {data.matches.map((m) => (
            <option key={m.id} value={m.id}>
              {m.id} · {slotLabel(data, m.team1)} vs {slotLabel(data, m.team2)}
            </option>
          ))}
        </select>
      </Field>

      <p className="text-sm text-fg-muted">
        {slotLabel(data, match.team1)} <span className="text-fg-dim">vs</span> {slotLabel(data, match.team2)} · {match.format} · {match.date}
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Situação">
          <select className={inputClass} value={match.status} onChange={(e) => patch({ status: e.target.value as MatchStatus })}>
            <option value="scheduled">Agendada</option>
            <option value="live">Ao vivo</option>
            <option value="completed">Encerrada</option>
            <option value="postponed">Adiada</option>
          </select>
        </Field>
        <Field label="W.O. (opcional)">
          <select
            className={inputClass}
            value={match.walkover ?? ''}
            onChange={(e) => patch({ walkover: e.target.value ? (Number(e.target.value) as 1 | 2) : undefined, maps: e.target.value ? [] : match.maps })}
          >
            <option value="">Sem W.O.</option>
            <option value="1">Vitória da equipe 1</option>
            <option value="2">Vitória da equipe 2</option>
          </select>
        </Field>
      </div>

      {!match.walkover && (
        <div className="space-y-3">
          <p className="text-[0.68rem] font-semibold tracking-[0.14em] text-fg-dim uppercase">Mapas · rounds [equipe 1, equipe 2]</p>
          {maps.map((row, i) => (
            <div key={i} className="grid grid-cols-[1fr_5rem_5rem] gap-2">
              <input
                className={inputClass}
                placeholder={`Mapa ${i + 1} (opcional)`}
                value={row.map ?? ''}
                onChange={(e) => setMap(i, { ...row, map: e.target.value })}
              />
              <input
                className={inputClass}
                type="number"
                min={0}
                value={row.rounds?.[0] ?? 0}
                onChange={(e) => setMap(i, { ...row, rounds: [Number(e.target.value), row.rounds?.[1] ?? 0] })}
              />
              <input
                className={inputClass}
                type="number"
                min={0}
                value={row.rounds?.[1] ?? 0}
                onChange={(e) => setMap(i, { ...row, rounds: [row.rounds?.[0] ?? 0, Number(e.target.value)] })}
              />
            </div>
          ))}
          <p className="text-xs text-fg-dim">
            MD1: um mapa. MD3: deixe 0–0 nos mapas não jogados; a série só encerra com 2 vitórias.
          </p>
        </div>
      )}
    </div>
  );
}
