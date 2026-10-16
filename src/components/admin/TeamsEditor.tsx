import type { TournamentData } from '../../lib/tournament-data';
import { Field, inputClass } from './fields';

export function TeamsEditor({ data, onChange }: { data: TournamentData; onChange: (next: TournamentData) => void }) {
  const patch = (id: string, name: string, shortName: string) => {
    onChange({
      ...data,
      teams: data.teams.map((t) => (t.id === id ? { ...t, name, shortName, isPlaceholder: false } : t)),
    });
  };

  return (
    <ul className="space-y-3">
      {data.teams.map((team) => (
        <li key={team.id} className="grid gap-3 rounded-xl border border-line bg-ink-850/60 p-4 sm:grid-cols-[3rem_1fr_8rem]">
          <div className="font-display text-2xl font-extrabold text-fg-dim">{team.id}</div>
          <Field label="Nome">
            <input className={inputClass} value={team.name} onChange={(e) => patch(team.id, e.target.value, team.shortName)} />
          </Field>
          <Field label="Sigla">
            <input className={inputClass} value={team.shortName} onChange={(e) => patch(team.id, team.name, e.target.value)} />
          </Field>
        </li>
      ))}
    </ul>
  );
}
