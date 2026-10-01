import { cn } from "@/lib/cn";
import type { Photo as PhotoData } from "@/lib/content/types";
import { PlaceholderImage, type PlaceholderTone } from "./PlaceholderImage";
import { ResponsiveImage } from "./ResponsiveImage";

type PhotoProps = {
  photo: PhotoData | null;
  /** Shown when there is no photo yet. */
  fallbackTone: PlaceholderTone;
  fallbackLabel: string;
  /** Tailwind aspect class, e.g. "aspect-[16/9]". */
  aspect: string;
  /** Which widths the browser should expect, for picking the right file size. */
  sizes: string;
  /** Load immediately (for the main image at the top of a page). */
  priority?: boolean;
  /** Credit line, e.g. "Photo: Jane Doe · CC BY 2.0". Links to the photo's
   * source page when it has one (Creative Commons licences ask for that). */
  credit?: string;
  className?: string;
};

/**
 * A content photo, or the labelled placeholder gradient while there is none.
 * The photographer credit is shown on the image when given.
 */
export function Photo({
  photo,
  fallbackTone,
  fallbackLabel,
  aspect,
  sizes,
  priority,
  credit,
  className,
}: PhotoProps) {
  if (!photo) {
    return (
      <PlaceholderImage
        tone={fallbackTone}
        label={fallbackLabel}
        aspect={aspect}
        className={className}
      />
    );
  }
  return (
    <figure
      className={cn("relative overflow-hidden bg-sand-100", aspect, className)}
    >
      <ResponsiveImage
        src={photo.src}
        alt={photo.alt}
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
      {credit && (
        <figcaption className="absolute right-2 bottom-2 max-w-[calc(100%-1rem)] truncate rounded-sm bg-black/60 px-2 py-0.5 text-[0.6875rem] text-white">
          {photo.creditUrl ? (
            <a
              href={photo.creditUrl}
              rel="noopener"
              target="_blank"
              className="underline-offset-2 hover:underline"
            >
              {credit}
            </a>
          ) : (
            credit
          )}
        </figcaption>
      )}
    </figure>
  );
}
