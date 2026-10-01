import { cn } from "@/lib/cn";

export type PlaceholderTone = "lagoon" | "sunset" | "sand" | "ocean";

type PlaceholderImageProps = {
  tone?: PlaceholderTone;
  /** What the real photo should show, e.g. "Le Morne at sunset". */
  label?: string;
  /** Tailwind aspect class, e.g. "aspect-[4/3]". Defaults to 3:2. */
  aspect?: string;
  className?: string;
};

// Soft gradients in the site palette. They stand in for photos we do not have
// yet, without pretending to show a real place.
const gradients: Record<PlaceholderTone, string> = {
  lagoon: "bg-linear-to-br from-lagoon-100 via-lagoon-300 to-ocean-400",
  sunset: "bg-linear-to-b from-coral-200 via-coral-300 to-ocean-600",
  sand: "bg-linear-to-br from-sand-50 via-sand-200 to-lagoon-200",
  ocean: "bg-linear-to-br from-ocean-500 via-ocean-700 to-ocean-950",
};

/**
 * Clearly labelled stand-in for a photo. Used for every place-specific image
 * until real photos exist (we never show a stock photo of the wrong place).
 */
export function PlaceholderImage({
  tone = "lagoon",
  label,
  aspect = "aspect-[3/2]",
  className,
}: PlaceholderImageProps) {
  const dark = tone === "ocean" || tone === "sunset";
  return (
    <div
      role="img"
      aria-label={label ? `Placeholder image: ${label}` : "Placeholder image"}
      className={cn(
        "relative overflow-hidden",
        gradients[tone],
        aspect,
        className,
      )}
    >
      <span
        className={cn(
          "absolute bottom-3 left-3 max-w-[calc(100%-1.5rem)] rounded-sm px-2 py-1 text-[0.625rem] font-medium tracking-[0.14em] uppercase",
          dark ? "bg-black/25 text-white" : "bg-white/70 text-ocean-900",
        )}
      >
        Placeholder image{label ? ` · ${label}` : ""}
      </span>
    </div>
  );
}
