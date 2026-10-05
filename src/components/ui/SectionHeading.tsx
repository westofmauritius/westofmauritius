import { cn } from "@/lib/cn";
import { Eyebrow } from "./Eyebrow";
import { Headline } from "./Headline";

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
        "reveal max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow && (
        <Eyebrow className={cn("mb-4", align === "center" && "justify-center")}>
          {eyebrow}
        </Eyebrow>
      )}
      {/* "*word*" in the title is set in italic in the accent colour. */}
      <Headline as={Heading} size={Heading === "h1" ? "h1" : "h2"}>
        {title}
      </Headline>
      {intro && <p className="mt-5 lead text-ink-muted">{intro}</p>}
    </div>
  );
}
