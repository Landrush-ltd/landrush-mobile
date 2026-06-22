/**
 * LandrushLogo — React + Tailwind CSS component
 *
 * Usage (web / any React project with Tailwind):
 *   import { LandrushLogo } from '@/components/LandrushLogo';
 *   <LandrushLogo iconSize={96} />
 *
 * The icon is pure SVG so it scales crisply at any size.
 * The concave notch uses a white circle overlay — works on any white background.
 */
export function LandrushLogo({
  iconSize = 96,
  className = '',
}: {
  iconSize?: number;
  className?: string;
}) {
  const DARK = '#1A5E3A';   // deep forest green
  const LIME = '#9FBB44';   // lime accent

  // Typography scales with icon
  const fontSize = Math.round(iconSize * 0.495);

  return (
    <div className={`inline-flex items-center select-none ${className}`} style={{ gap: iconSize * 0.18 }}>

      {/* ── 2 × 2 Grid Icon ───────────────────────────────────── */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Clip arc lines to the lime cell */}
          <clipPath id="lr-bl">
            <rect x="0" y="56" width="44" height="44" rx="10" />
          </clipPath>
        </defs>

        {/* Top-left — dark green */}
        <rect x="0" y="0" width="44" height="44" rx="10" fill={DARK} />

        {/* Top-right — dark green */}
        <rect x="56" y="0" width="44" height="44" rx="10" fill={DARK} />

        {/* Bottom-left — lime + two terrain-contour arcs */}
        <rect x="0" y="56" width="44" height="44" rx="10" fill={LIME} />
        <g clipPath="url(#lr-bl)">
          {/* Upper arc  */}
          <path
            d="M 44 83 Q 20 76 0 74"
            stroke="rgba(255,255,255,0.62)"
            strokeWidth="5.5"
            strokeLinecap="round"
          />
          {/* Lower arc */}
          <path
            d="M 44 95 Q 22 89 2 87"
            stroke="rgba(255,255,255,0.62)"
            strokeWidth="5.5"
            strokeLinecap="round"
          />
        </g>

        {/* Bottom-right — dark green */}
        <rect x="56" y="56" width="44" height="44" rx="10" fill={DARK} />
        {/*
          Concave notch: a white circle at the inner-corner point (56, 56)
          "punches out" a quarter-circle, creating the concave arc effect.
          Works perfectly on white backgrounds.
        */}
        <circle cx="56" cy="56" r="21" fill="white" />
      </svg>

      {/* ── Wordmark — LAND / RUSH stacked ────────────────────── */}
      <div
        style={{
          color: LIME,
          fontSize,
          fontWeight: 900,
          lineHeight: 0.91,
          letterSpacing: `${fontSize * 0.09}px`,
          textTransform: 'uppercase' as const,
        }}
      >
        <div>LAND</div>
        <div>RUSH</div>
      </div>
    </div>
  );
}
