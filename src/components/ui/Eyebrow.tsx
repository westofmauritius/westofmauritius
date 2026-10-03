import { cn } from "@/lib/cn";

type EyebrowProps = {
  children: React.ReactNode;
  /** Shows a location pin before the text, for places: "Tamarin · West coast". */
  icon?: "pin";
  /** "dark" on photos and dark sections, where the lighter accent is legible. */
  tone?: "light" | "dark";
  /** Defaults to <p>; use "span" inside other text elements. */
  as?: "p" | "span" | "div";
  className?: string;
};

/**
 * The small uppercase line above a headline: the sans font, wide letter
 * spacing, in the accent colour. Write the text in normal case
 * ("Tamarin · West coast · Mauritius"); CSS sets the capitals so screen
 * readers do not spell it out letter by letter.
 */
export function Eyebrow({
  children,
  icon,
  tone = "light",
  as: Tag = "p",
  className,
}: EyebrowProps) {
  return (
    <Tag
      className={cn(
        "flex items-center gap-2 eyebrow",
        tone === "dark" && "text-accent-on-dark",
        className,
      )}
    >
      {icon === "pin" && <PinIcon />}
      <span>{children}</span>
    </Tag>
  );
}

function PinIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="size-[1.35em] shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );
}
