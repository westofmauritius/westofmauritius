import { cn } from "@/lib/cn";

type WaveProps = {
  /** Text colour class of the section below, e.g. "text-lagoon-50". */
  className?: string;
  /** Mirrors the wave so two in a row do not look the same. */
  flip?: boolean;
  /**
   * For sections that clip their overflow: the wave hangs down inside the
   * top of the section instead, filled with the colour of the one above.
   */
  inside?: boolean;
};

/**
 * A soft wave where two coloured sections meet, like the edge of the
 * lagoon on the sand, instead of a hard line. Place it as the first child of
 * a `relative` section; it sits just above the section, filled with the
 * section's colour (set with a text colour class). Decorative only.
 */
export function Wave({ className, flip, inside }: WaveProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-x-0 h-5 overflow-hidden sm:h-8",
        inside ? "top-0 -scale-y-100" : "bottom-full",
        flip && (inside ? "-scale-100" : "-scale-x-100"),
        className,
      )}
    >
      <svg
        viewBox="0 0 1440 40"
        preserveAspectRatio="none"
        className="block h-full w-full"
      >
        <path
          d="M0 40V24C180 8 360 4 560 14s400 26 600 18 220-18 280-24v32Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}
