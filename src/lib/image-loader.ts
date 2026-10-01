import { allImageWidths, optimizableImage } from "./image-sizes";

/**
 * Custom next/image loader: points at the resized WebP copies that
 * scripts/optimize-images.mjs creates at build time, e.g.
 *   /images/places/x/photo.jpg at 960 px → /_img/images/places/x/photo-960.webp
 * Other files (SVGs, external URLs) are returned unchanged.
 */
export default function imageLoader({
  src,
  width,
}: {
  src: string;
  width: number;
}): string {
  if (!optimizableImage.test(src)) return src;
  // Next.js only asks for configured widths, but pick the nearest larger one to be safe.
  const size = allImageWidths.find((w) => w >= width) ?? allImageWidths.at(-1)!;
  return `/_img${src.replace(/\.[^.]+$/, "")}-${size}.webp`;
}
