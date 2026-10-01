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
  className?: string;
};

/**
 * A content photo, or the labelled placeholder gradient while there is none.
 * Photographers are credited on the photo credits page, not on the image.
 */
export function Photo({
  photo,
  fallbackTone,
  fallbackLabel,
  aspect,
  sizes,
  priority,
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
    </figure>
  );
}
