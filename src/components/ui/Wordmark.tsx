import { cn } from "@/lib/cn";

type WordmarkProps = {
  /** "West Mauritius" or "Ouest Maurice". */
  name: string;
  /** Use "light" on dark backgrounds such as photos or the ocean footer. */
  tone?: "dark" | "light";
  className?: string;
};

/**
 * Text logo: a small sun setting on the horizon, followed by the brand name in
 * the serif display font. Being text, it stays sharp at any size and needs no
 * image download. A designed logo can replace the SVG later.
 */
export function Wordmark({ name, tone = "dark", className }: WordmarkProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2.5 font-display text-2xl leading-none font-normal tracking-[0.01em]",
        tone === "dark" ? "text-ocean-900" : "text-white",
        className,
      )}
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="size-[1.05em] shrink-0 translate-y-[-0.04em]"
      >
        {/* Half sun above the horizon. */}
        <path d="M4 15a8 8 0 0 1 16 0Z" className="fill-coral-500" />
        {/* Horizon line, then a shorter reflection line in the lagoon. */}
        <rect
          x="1"
          y="16.5"
          width="22"
          height="1.6"
          rx="0.8"
          className="fill-current"
        />
        <rect
          x="6"
          y="20"
          width="12"
          height="1.6"
          rx="0.8"
          className={tone === "dark" ? "fill-lagoon-500" : "fill-lagoon-300"}
        />
      </svg>
      <span>{name}</span>
    </span>
  );
}
