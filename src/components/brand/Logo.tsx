import { useImageStatus } from '../../hooks/useImageStatus';
import { assetUrl } from '../../lib/display';
import { useTournament } from '../../state/context';

type WordmarkSize = 'sm' | 'md' | 'xl';

const WORDMARK_SIZES: Record<WordmarkSize, string> = {
  sm: 'text-[1.35rem]',
  md: 'text-[1.9rem]',
  xl: 'text-[clamp(3.2rem,10vw,7.5rem)]',
};

/**
 * Versão tipográfica do nome, usada enquanto a logo oficial não existe.
 * Destaca a segunda palavra de "UEMG champions" com a cor de destaque.
 */
export function Wordmark({ size = 'md', className = '' }: { size?: WordmarkSize; className?: string }) {
  const { model } = useTournament();
  const name = model.config.displayName;
  const match = /^(\S+)\s+(.+)$/.exec(name);

  return (
    <span
      className={`font-display leading-[0.85] font-extrabold whitespace-nowrap tracking-[-0.01em] uppercase ${WORDMARK_SIZES[size]} ${className}`}
      aria-label={name}
    >
      {match ? (
        <span aria-hidden="true">
          <span className="text-fg">{match[1]}</span>{' '}
          <span className="text-accent">{match[2]}</span>
        </span>
      ) : (
        <span aria-hidden="true" className="text-fg">
          {name}
        </span>
      )}
    </span>
  );
}

type LogoPlacement = 'header' | 'footer' | 'hero';

/** Logo oficial quando o arquivo existir; caso contrário, o nome em texto. */
export function Logo({ placement, className = '' }: { placement: LogoPlacement; className?: string }) {
  const { model } = useTournament();
  const { logo } = model.config;
  const src = assetUrl(logo.src);
  const status = useImageStatus(src);
  const height =
    placement === 'header' ? logo.headerHeight : placement === 'footer' ? logo.footerHeight : logo.heroHeight;

  if (status === 'loaded') {
    const showName = placement === 'header' && logo.showNameNextToLogoInHeader;
    return (
      <span className={`inline-flex items-center gap-3 ${className}`}>
        <img src={src} alt={logo.alt} style={{ height }} className="w-auto max-w-full object-contain" />
        {showName && <Wordmark size="sm" className="hidden sm:inline" />}
      </span>
    );
  }

  return (
    <Wordmark size={placement === 'hero' ? 'xl' : placement === 'footer' ? 'md' : 'sm'} className={className} />
  );
}
