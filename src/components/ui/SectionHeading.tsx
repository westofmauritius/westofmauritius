import { cn } from "@/lib/cn";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  intro?: string;
  /** Heading level. Defaults to h2; use "h1" once per page. */
  as?: "h1" | "h2" | "h3";
  align?: "left" | "center";
  className?: string;
};

/** Eyebrow + serif heading + optional intro: the standard start of a section. */
export function SectionHeading({
  eyebrow,
  title,
  intro,
  as: Heading = "h2",
  align = "left",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow && <p className="mb-3 eyebrow text-ink-muted">{eyebrow}</p>}
      <Heading
        className={Heading === "h1" ? "text-display-1" : "text-display-2"}
      >
        {title}
      </Heading>
      {intro && <p className="mt-4 lead text-ink-muted">{intro}</p>}
    </div>
  );
}
