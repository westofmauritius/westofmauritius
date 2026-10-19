/**
 * The Soley wordmark: a sun rising over a horizon line, then the name. The
 * sun is drawn in SVG so it stays sharp and weighs almost nothing.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <svg
        aria-hidden="true"
        viewBox="0 0 32 32"
        width="32"
        height="32"
        className="shrink-0"
      >
        <circle cx="16" cy="17" r="7" fill="var(--color-sun-400)" />
        <g
          stroke="var(--color-sun-500)"
          strokeWidth="2.2"
          strokeLinecap="round"
        >
          <path d="M16 3v4M5.5 7.5l2.8 2.8M26.5 7.5l-2.8 2.8M2 17h4M26 17h4" />
        </g>
        <rect x="2" y="23" width="28" height="3" rx="1.5" fill="currentColor" />
      </svg>
      <span className="text-2xl font-extrabold tracking-tight">Soley</span>
    </span>
  );
}
