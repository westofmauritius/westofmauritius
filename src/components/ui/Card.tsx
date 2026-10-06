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
 * Editorial card for places, guides and areas: image on top, label and title
 * below, the whole card is one link. No summary text: the owner wants cards
 * to stay visual and compact (summaries are on the pages themselves). Kept quiet (no borders, no shadows) to feel
 * like a magazine rather than a listings site.
 */
export function Card({
  href,
  title,
  eyebrow,
  image,
  placeholderTone = "lagoon",
  featured,
  featuredLabel = "Featured",
  placeholder,
  placeholderLabel = "Placeholder",
  className,
}: CardProps) {
  return (
    <article
      className={cn(
        "group reveal relative flex flex-col transition-transform duration-300 hover:[transform:translateY(-0.25rem)]",
        className,
      )}
    >
      <div className="relative overflow-hidden rounded-2xl shadow-sm transition-shadow duration-300 group-hover:shadow-xl group-hover:shadow-ocean-900/10">
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
      <div className="pt-3 sm:pt-4">
        {eyebrow && (
          <p className="mb-1.5 font-sans text-[0.6875rem] font-medium tracking-[0.16em] text-accent uppercase sm:mb-2 sm:text-eyebrow sm:tracking-[0.2em]">
            {eyebrow}
          </p>
        )}
        <h3 className="text-[1.1875rem] leading-snug sm:text-2xl sm:leading-tight">
          {/* The ::after makes the whole card clickable while keeping one link. */}
          <Link
            href={href}
            className="group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4 after:absolute after:inset-0"
          >
            {title}
          </Link>
        </h3>
      </div>
    </article>
  );
}
