import { useCallback } from 'react';
import { useTicker } from '../../hooks/useTicker';
import { countdownParts } from '../../lib/time';
import { useTournament } from '../../state/context';

/** Contagem regressiva calculada a partir do horário configurado da partida. */
export function Countdown({ target }: { target: Date }) {
  const { clock } = useTournament();
  const read = useCallback(() => countdownParts(target, clock()), [target, clock]);
  const parts = useTicker(read, 1000);

  const units = [
    { value: parts.days, label: 'dias' },
    { value: parts.hours, label: 'horas' },
    { value: parts.minutes, label: 'min' },
    { value: parts.seconds, label: 'seg' },
  ];

  const accessible = `${parts.days} dias, ${parts.hours} horas e ${parts.minutes} minutos para o início previsto`;

  return (
    <div>
      <p className="sr-only" aria-live="off">
        {accessible}
      </p>
      <div className="grid grid-cols-4 gap-2" aria-hidden="true">
        {units.map((unit) => (
          <div key={unit.label} className="rounded-lg border border-line bg-ink-950/60 px-2 py-2.5 text-center">
            <div className="font-display text-[1.9rem] leading-none font-bold text-fg tabular">
              {String(unit.value).padStart(2, '0')}
            </div>
            <div className="mt-1 text-[0.65rem] font-semibold tracking-[0.18em] text-fg-dim uppercase">{unit.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
