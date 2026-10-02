import { ResponsiveImage } from "@/components/ui/ResponsiveImage";
import type { Author } from "@/lib/content/author";
import { cn } from "@/lib/cn";

/** The author's portrait, or their initial until a portrait is added. */
export function AuthorAvatar({
  author,
  size,
  className,
}: {
  author: Author;
  /** Rendered width in pixels, for picking the image file. */
  size: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-ocean-900 font-display text-white",
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.45 }}
      aria-hidden={author.photo ? undefined : true}
    >
      {author.photo ? (
        <ResponsiveImage
          src={author.photo.src}
          alt={author.photo.alt}
          sizes={`${size}px`}
          className="object-cover"
        />
      ) : (
        author.name.slice(0, 1)
      )}
    </span>
  );
}
