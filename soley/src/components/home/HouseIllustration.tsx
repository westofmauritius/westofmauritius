/**
 * Placeholder illustration: a flat-roofed concrete house, typical in
 * Mauritius, with solar panels on the roof, under the sun. It stands in for
 * real photos of Mauritian homes until the owner supplies them (see
 * LAUNCH_CHECKLIST.md), and is labelled as a placeholder where it is used.
 * As inline SVG it weighs a few kB and causes no layout shift.
 */
export function HouseIllustration({
  title,
  className,
}: {
  title: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 480 360"
      role="img"
      aria-label={title}
      className={className}
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#dcebf5" />
          <stop offset="1" stopColor="#fff8e1" />
        </linearGradient>
        <linearGradient id="panel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1d5a8a" />
          <stop offset="1" stopColor="#0a2e4a" />
        </linearGradient>
      </defs>
      <rect width="480" height="360" rx="28" fill="url(#sky)" />
      <circle cx="380" cy="80" r="42" fill="#fcc436" />
      <circle cx="380" cy="80" r="60" fill="#fcc436" opacity="0.25" />
      {/* Mountains in the distance, like the Moka range. */}
      <path
        d="M0 240 L70 170 L120 205 L190 130 L250 200 L310 160 L380 215 L480 175 L480 360 L0 360Z"
        fill="#b5d4ea"
      />
      {/* Palm tree */}
      <path
        d="M78 300 C82 260 86 230 96 200"
        stroke="#7a5a3a"
        strokeWidth="6"
        fill="none"
      />
      <path
        d="M96 200 C80 190 60 192 48 202 M96 200 C88 182 72 172 56 172 M96 200 C104 182 120 176 138 180 M96 200 C112 194 128 200 138 214 M96 200 C98 184 96 168 88 156"
        stroke="#2f7d4f"
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />
      {/* House */}
      <rect
        x="150"
        y="190"
        width="230"
        height="120"
        fill="#fffbf3"
        stroke="#0a2e4a"
        strokeWidth="3"
      />
      <rect
        x="140"
        y="178"
        width="250"
        height="16"
        fill="#e4d3b2"
        stroke="#0a2e4a"
        strokeWidth="3"
      />
      <rect
        x="180"
        y="230"
        width="44"
        height="40"
        fill="#82b3d8"
        stroke="#0a2e4a"
        strokeWidth="3"
      />
      <rect
        x="300"
        y="230"
        width="44"
        height="40"
        fill="#82b3d8"
        stroke="#0a2e4a"
        strokeWidth="3"
      />
      <rect
        x="244"
        y="240"
        width="38"
        height="70"
        fill="#c98a00"
        stroke="#0a2e4a"
        strokeWidth="3"
      />
      {/* Solar panels on the flat roof, tilted on frames */}
      {[0, 1, 2, 3].map((i) => (
        <g key={i} transform={`translate(${166 + i * 54} 150)`}>
          <path
            d="M0 28 L10 0 L50 0 L40 28Z"
            fill="url(#panel)"
            stroke="#0a2e4a"
            strokeWidth="2"
          />
          <path
            d="M20 0 L10 28 M30 0 L20 28 M5 14 L45 14"
            stroke="#4b8cc0"
            strokeWidth="1"
          />
          <path
            d="M40 28 L40 30 M0 28 L0 30"
            stroke="#0a2e4a"
            strokeWidth="2"
          />
        </g>
      ))}
      <rect x="0" y="308" width="480" height="52" fill="#e4d3b2" />
    </svg>
  );
}
