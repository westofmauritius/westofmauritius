import { cn } from "@/lib/cn";

type Size = "display" | "h1" | "h2" | "h3" | "h4";

type HeadlineProps = {
  /**
   * The text. Wrap one key word in asterisks to set it in italic in the
   * accent colour: "The *best* coast." Editors can do the same in
   * translations and Keystatic titles.
   */
  children: string;
  /** Which element to render; defaults to h2. Use h1 once per page. */
  as?: "h1" | "h2" | "h3" | "h4" | "p";
  /** Step of the type scale; defaults to the element's own size. */
  size?: Size;
  /** "dark" when the headline sits on a photo or a dark section. */
  tone?: "light" | "dark";
  className?: string;
};

const sizes: Record<Size, string> = {
  display: "type-display",
  h1: "type-h1",
  h2: "type-h2",
  h3: "type-h3",
  h4: "type-h4",
};

/** Splits "The *best* coast." into plain and accent parts. */
export function splitAccent(text: string) {
  return text.split(/\*([^*]+)\*/).map((part, i) => ({
    text: part,
    accent: i % 2 === 1,
  }));
}

/** The text without accent markers, for page titles and metadata. */
export function plainHeadline(text: string) {
  return text.replace(/\*([^*]+)\*/g, "$1");
}

/**
 * A serif headline from the type scale, with an optional key word in
 * italic in the accent colour. The accent word never breaks onto a line of
 * its own mid word, and text-wrap: balance keeps lines even.
 */
export function Headline({
  children,
  as: Tag = "h2",
  size,
  tone = "light",
  className,
}: HeadlineProps) {
  const step = size ?? (Tag === "p" ? "h2" : Tag);
  return (
    <Tag className={cn(sizes[step], className)}>
      {splitAccent(children).map(({ text, accent }, i) =>
        accent ? (
          <em
            key={i}
            className={cn(
              "serif-italic whitespace-nowrap",
              tone === "dark" ? "text-accent-on-dark" : "text-accent",
            )}
          >
            {text}
          </em>
        ) : (
          text
        ),
      )}
    </Tag>
  );
}
