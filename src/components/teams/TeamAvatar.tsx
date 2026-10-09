import { useImageStatus } from '../../hooks/useImageStatus';
import { assetUrl, teamInitials } from '../../lib/display';
import type { TeamDefinition } from '../../types/tournament';

const SIZES = {
  xs: 'size-6 text-[0.62rem] rounded-md',
  sm: 'size-8 text-[0.72rem] rounded-md',
  md: 'size-12 text-base rounded-lg',
  lg: 'size-16 text-xl rounded-xl',
  xl: 'size-24 text-3xl rounded-2xl',
} as const;

type AvatarSize = keyof typeof SIZES;

/** Logo da equipe ou, na falta dela, um monograma com o identificador. */
export function TeamAvatar({ team, size = 'md', dimmed = false }: { team: TeamDefinition; size?: AvatarSize; dimmed?: boolean }) {
  const src = team.logo ? assetUrl(team.logo) : null;
  const status = useImageStatus(src);

  return (
    <span
      className={`relative inline-grid shrink-0 place-items-center overflow-hidden border border-line-strong bg-ink-700 font-display font-extrabold text-fg ${SIZES[size]} ${
        dimmed ? 'opacity-50 grayscale' : ''
      }`}
      aria-hidden="true"
    >
      {src && status === 'loaded' ? (
        <img src={src} alt="" className="size-full object-contain p-[12%]" />
      ) : (
        <>
          <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgb(255_255_255/0.08),transparent_60%)]" />
          <span className="relative">{teamInitials(team)}</span>
        </>
      )}
    </span>
  );
}

/** Avatar neutro para vagas ainda não definidas. */
export function EmptyAvatar({ size = 'md' }: { size?: AvatarSize }) {
  return (
    <span
      className={`inline-grid shrink-0 place-items-center border border-dashed border-line-strong bg-transparent font-display text-fg-dim ${SIZES[size]}`}
      aria-hidden="true"
    >
      ?
    </span>
  );
}
