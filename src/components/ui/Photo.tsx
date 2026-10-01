import Image from "next/image";
import { cn } from "@/lib/cn";
import type { Photo as PhotoData } from "@/lib/content/types";
import { PlaceholderImage, type PlaceholderTone } from "./PlaceholderImage";

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
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
      {credit && (
        <figcaption className="absolute right-2 bottom-2 rounded-sm bg-black/35 px-2 py-0.5 text-[0.625rem] text-white">
          {credit}
        </figcaption>
      )}
    </figure>
  );
}
