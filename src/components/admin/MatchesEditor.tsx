import { useMemo, useState } from 'react';
import type { TournamentData } from '../../lib/tournament-data';
import type { MatchStatus, SeriesFormat, SlotSource, StageId, TimeOfDay } from '../../types/tournament';
import { Field, inputClass } from './fields';

const STAGES: StageId[] = ['preliminary', 'quarterfinal', 'semifinal', 'final'];
const FORMATS: SeriesFormat[] = ['MD1', 'MD3'];

function sourceKind(source: SlotSource): 'team' | 'winner' {
  return 'team' in source ? 'team' : 'winner';
}

function sourceValue(source: SlotSource): string {
  return 'team' in source ? source.team : source.winnerOf;
}

function toSource(kind: 'team' | 'winner', value: string): SlotSource {
  return kind === 'team' ? { team: value } : { winnerOf: value };
}

export function MatchesEditor({ data, onChange }: { data: TournamentData; onChange: (next: TournamentData) => void }) {
  const [matchId, setMatchId] = useState(data.matches[0]?.id ?? '');
  const match = useMemo(() => data.matches.find((m) => m.id === matchId) ?? data.matches[0], [data.matches, matchId]);
  const matchIds = data.matches.map((m) => m.id);
  const teamIds = data.teams.map((t) => t.id);
  if (!match) return <p className="text-sm text-fg-muted">Nenhuma partida cadastrada.</p>;

  const patch = (partial: Partial<typeof match>) => {
    onChange({
      ...data,
      matches: data.matches.map((m) => (m.id === match.id ? { ...m, ...partial } : m)),
    });
  };

  const slotField = (side: 1 | 2) => {
    const key = side === 1 ? 'team1' : 'team2';
    const source = match[key];
    const kind = sourceKind(source);
    return (
      <div className="grid grid-cols-2 gap-2">
        <Field label={`Lado ${side}`}>
          <select
            className={inputClass}
            value={kind}
            onChange={(e) => patch({ [key]: toSource(e.target.value as 'team' | 'winner', e.target.value === 'team' ? teamIds[0] ?? '' : matchIds[0] ?? '') })}
          >
            <option value="team">Equipe</option>
            <option value="winner">Vencedor de</option>
          </select>
        </Field>
        <Field label={kind === 'team' ? 'Equipe' : 'Partida'}>
          <select className={inputClass} value={sourceValue(source)} onChange={(e) => patch({ [key]: toSource(kind, e.target.value) })}>
            {(kind === 'team' ? teamIds : matchIds.filter((id) => id !== match.id)).map((id) => (
              <option key={id} value={id}>
                {kind === 'team' ? `${id} · ${data.teams.find((t) => t.id === id)?.name ?? id}` : id}
              </option>
            ))}
          </select>
        </Field>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      <Field label="Partida">
        <select className={inputClass} value={match.id} onChange={(e) => setMatchId(e.target.value)}>
          {data.matches.map((m) => (
            <option key={m.id} value={m.id}>
              {m.id} · {m.date} · {m.format}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Dia">
          <input className={inputClass} type="date" value={match.date} onChange={(e) => patch({ date: e.target.value })} />
        </Field>
        <Field label="Ordem no dia">
          <input className={inputClass} type="number" min={1} value={match.order} onChange={(e) => patch({ order: Number(e.target.value) })} />
        </Field>
        <Field label="Fase">
          <select className={inputClass} value={match.stage} onChange={(e) => patch({ stage: e.target.value as StageId })}>
            {STAGES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Formato">
          <select className={inputClass} value={match.format} onChange={(e) => patch({ format: e.target.value as SeriesFormat })}>
            {FORMATS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Situação">
          <select className={inputClass} value={match.status} onChange={(e) => patch({ status: e.target.value as MatchStatus })}>
            <option value="scheduled">Agendada</option>
            <option value="live">Ao vivo</option>
            <option value="completed">Encerrada</option>
            <option value="postponed">Adiada</option>
          </select>
        </Field>
        <Field label="Horário fixo (opcional)">
          <input
            className={inputClass}
            placeholder="19:00"
            value={match.fixedTime ?? ''}
            onChange={(e) => patch({ fixedTime: (e.target.value || undefined) as TimeOfDay | undefined })}
          />
        </Field>
      </div>

      {slotField(1)}
      {slotField(2)}
    </div>
  );
}
