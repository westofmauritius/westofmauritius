import { brandMark } from "@/lib/brand-mark";
import { cn } from "@/lib/cn";

type WordmarkProps = {
  /** "West of Mauritius" or "Ouest Maurice". */
  name: string;
  /** Use "light" on dark backgrounds such as photos or the ocean footer. */
  tone?: "dark" | "light";
  className?: string;
};

/**
 * Logo: the Rempart mountain with the setting sun behind it (see
 * src/lib/brand-mark.ts), followed by the brand name in extra bold
 * Plus Jakarta Sans. Inline SVG and text: sharp at any size, no image download.
 */
export function Wordmark({ name, tone = "dark", className }: WordmarkProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2.5 font-wordmark text-2xl leading-none font-extrabold tracking-[-0.035em] whitespace-nowrap",
        tone === "dark" ? "text-ocean-900" : "text-white",
        className,
      )}
    >
      <svg
        viewBox={brandMark.viewBox}
        aria-hidden="true"
        className="size-[1.3em] shrink-0 translate-y-[-0.1em]"
      >
        {/* The setting sun behind the Rempart, then the lagoon below. */}
        <circle {...brandMark.sun} className="fill-coral-500" />
        <path d={brandMark.mountain} className="fill-current" />
        <rect
          {...brandMark.lagoon}
          className={tone === "dark" ? "fill-lagoon-500" : "fill-lagoon-300"}
        />
      </svg>
      <span>{name}</span>
    </span>
  );
}
