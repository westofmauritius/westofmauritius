import { Link, type Href } from "@/i18n/Link";
import { cn } from "@/lib/cn";
import { Badge } from "./Badge";
import { PlaceholderImage, type PlaceholderTone } from "./PlaceholderImage";

type CardProps = {
  /** Internal route, e.g. { pathname: "/places/[slug]", params: { slug } }. */
  href: Href;
  title: string;
  /** Small label above the title, e.g. the area or category. */
  eyebrow?: string;
  excerpt?: string;
  /** Real image (usually a next/image element). Omit to show a placeholder. */
  image?: React.ReactNode;
  placeholderTone?: PlaceholderTone;
  /** Shows the "Featured" badge, used for paid or editorial placements. */
  featured?: boolean;
  featuredLabel?: string;
  /** Marks the card's content as invented layout text. */
  placeholder?: boolean;
  placeholderLabel?: string;
  className?: string;
};

/**
 * Editorial card for places, guides and areas: image on top, text below,
 * the whole card is one link. Kept quiet (no borders, no shadows) to feel
 * like a magazine rather than a listings site.
 */
export function Card({
  href,
  title,
  eyebrow,
  excerpt,
  image,
  placeholderTone = "lagoon",
  featured,
  featuredLabel = "Featured",
  placeholder,
  placeholderLabel = "Placeholder",
  className,
}: CardProps) {
  return (
    <article className={cn("group relative flex flex-col", className)}>
      <div className="relative overflow-hidden rounded-sm">
        <div className="transition-transform duration-700 ease-out group-hover:scale-[1.03]">
          {image ?? (
            <PlaceholderImage
              tone={placeholderTone}
              aspect="aspect-[4/3]"
              label={title}
            />
          )}
        </div>
        {(featured || placeholder) && (
          <div className="absolute top-3 left-3 flex gap-2">
            {featured && <Badge variant="featured">{featuredLabel}</Badge>}
            {placeholder && (
              <Badge variant="placeholder">{placeholderLabel}</Badge>
            )}
          </div>
        )}
      </div>
      <div className="pt-4">
        {eyebrow && <p className="mb-2 eyebrow text-ink-muted">{eyebrow}</p>}
        <h3 className="text-2xl leading-tight">
          {/* The ::after makes the whole card clickable while keeping one link. */}
          <Link
            href={href}
            className="group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4 after:absolute after:inset-0"
          >
            {title}
          </Link>
        </h3>
        {excerpt && (
          <p className="mt-2 leading-relaxed text-ink-muted">{excerpt}</p>
        )}
      </div>
    </article>
  );
}
