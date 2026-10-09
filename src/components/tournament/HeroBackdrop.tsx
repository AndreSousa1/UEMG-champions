/** Composição gráfica do topo: grade de mapa tático, radar e marcações. Puramente decorativa. */
export function HeroBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_70%_0%,#0f1a2b_0%,transparent_70%)]" />
      <div className="bg-tactical-grid absolute inset-0 [mask-image:radial-gradient(ellipse_70%_75%_at_72%_40%,black_20%,transparent_75%)]" />
      <div className="absolute -top-40 right-[-10%] size-[42rem] rounded-full bg-accent/[0.05] blur-3xl" />

      <svg
        className="absolute top-1/2 right-[-18rem] h-[52rem] w-[52rem] -translate-y-[46%] text-[rgb(150_172_204)] sm:right-[-12rem] lg:right-[-6rem]"
        viewBox="0 0 800 800"
        fill="none"
      >
        <g stroke="currentColor" strokeOpacity="0.11">
          <circle cx="400" cy="400" r="110" />
          <circle cx="400" cy="400" r="210" />
          <circle cx="400" cy="400" r="310" strokeDasharray="2 8" />
          <circle cx="400" cy="400" r="390" />
          <path d="M400 0v800M0 400h800" strokeDasharray="4 10" />
        </g>
        <g stroke="var(--color-accent)" strokeOpacity="0.55" strokeWidth="2" strokeLinecap="round">
          <path d="M400 360v-28M400 440v28M360 400h-28M440 400h28" />
        </g>
        <circle cx="400" cy="400" r="3" fill="var(--color-accent)" />
        <g className="origin-center animate-sweep" style={{ transformOrigin: '400px 400px' }}>
          <path d="M400 400 L400 10 A390 390 0 0 1 625 82 Z" fill="url(#sweep)" />
        </g>
        <g fontFamily="var(--font-display)" fontSize="13" fontWeight="700" letterSpacing="3" fill="currentColor" fillOpacity="0.32">
          <text x="575" y="250">A SITE</text>
          <text x="180" y="560">B SITE</text>
          <text x="420" y="520">MID</text>
          <text x="610" y="640">CT</text>
          <text x="150" y="190">T</text>
        </g>
        <g stroke="currentColor" strokeOpacity="0.2">
          <rect x="545" y="215" width="110" height="60" />
          <rect x="150" y="525" width="110" height="60" />
          <path d="M260 555 H400 V470 H545 V275" strokeDasharray="3 6" />
        </g>
        <defs>
          <linearGradient id="sweep" x1="400" y1="400" x2="560" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="var(--color-accent)" stopOpacity="0" />
            <stop offset="1" stopColor="var(--color-accent)" stopOpacity="0.12" />
          </linearGradient>
        </defs>
      </svg>

      <div className="absolute bottom-10 left-0 hidden h-24 w-64 -skew-x-[28deg] lg:block">
        <div className="absolute inset-y-0 left-6 w-2 bg-accent/70" />
        <div className="absolute inset-y-0 left-12 w-2 bg-accent/30" />
        <div className="absolute inset-y-0 left-[4.5rem] w-2 bg-accent/10" />
      </div>

      <div className="bg-noise absolute inset-0" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-ink-950" />
    </div>
  );
}
