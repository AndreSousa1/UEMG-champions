import { useState } from 'react';
import { assetUrl } from '../../lib/display';
import type { Sponsor } from '../../types/sponsor';

interface SponsorLogoProps {
  sponsor: Sponsor;
  /** Respiro padrão quando o cadastro não define `logoPadding`. */
  defaultPadding: number;
  className?: string;
}

/**
 * Área da logo com proporção livre: a imagem é contida (sem corte nem
 * distorção) sobre a cor de fundo do arquivo original. Sem logo ou se o
 * arquivo falhar, mostra o nome da marca.
 */
export function SponsorLogo({ sponsor, defaultPadding, className = '' }: SponsorLogoProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const src = sponsor.logo ? assetUrl(sponsor.logo) : null;
  const showImage = src !== null && failedSrc !== src;
  const { logoBackground, logoAlt, logoPadding } = sponsor.displaySettings;

  return (
    <div
      className={`flex items-center justify-center overflow-hidden ${logoBackground ? '' : 'bg-ink-900'} ${className}`}
      style={{ backgroundColor: logoBackground, padding: logoPadding ?? defaultPadding }}
    >
      {showImage ? (
        <img
          src={src}
          alt={logoAlt ?? `Logo da ${sponsor.name}`}
          loading="lazy"
          decoding="async"
          onError={() => setFailedSrc(src)}
          className="h-full w-full object-contain"
        />
      ) : (
        <span className="px-3 text-center font-display text-2xl leading-tight font-extrabold tracking-wide text-fg uppercase">
          {sponsor.name}
        </span>
      )}
    </div>
  );
}
