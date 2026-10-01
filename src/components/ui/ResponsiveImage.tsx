import { getImageProps } from "next/image";
import { preload } from "react-dom";
import { optimizableImage } from "@/lib/image-sizes";

type ResponsiveImageProps = {
  src: string;
  alt: string;
  /** Which widths the browser should expect, for picking the right file size. */
  sizes: string;
  /** The main image at the top of a page: preload it and fetch it first. */
  priority?: boolean;
  className?: string;
};

/**
 * A photo that fills its (positioned) parent, served as AVIF to browsers
 * that support it and WebP to the rest.
 *
 * next/image can only produce one format, so this builds a <picture> from
 * its props: the build makes both formats at every width
 * (scripts/optimize-images.mjs), and the AVIF source simply swaps the file
 * extension. AVIF is about a third smaller, which matters most on phones.
 */
export function ResponsiveImage({
  src,
  alt,
  sizes,
  priority,
  className,
}: ResponsiveImageProps) {
  const { props } = getImageProps({
    src,
    alt,
    fill: true,
    sizes,
    className,
    loading: priority ? "eager" : "lazy",
    fetchPriority: priority ? "high" : undefined,
  });
  const avif = optimizableImage.test(src)
    ? {
        src: props.src.replace(/\.webp$/, ".avif"),
        srcSet: props.srcSet?.replace(/\.webp /g, ".avif "),
      }
    : null;

  if (priority) {
    // Start the main image straight from the <head>. "type" makes browsers
    // without AVIF support skip this preload instead of wasting the bytes.
    const best = avif ?? { src: props.src, srcSet: props.srcSet };
    preload(best.src, {
      as: "image",
      imageSrcSet: best.srcSet,
      imageSizes: props.sizes,
      fetchPriority: "high",
      ...(avif && { type: "image/avif" }),
    });
  }

  return (
    <picture>
      {avif && (
        <source type="image/avif" srcSet={avif.srcSet} sizes={props.sizes} />
      )}
      {/* The <img> next/image would render, inside <picture>. */}
      {/* eslint-disable-next-line jsx-a11y/alt-text -- alt is in the props. */}
      <img {...props} />
    </picture>
  );
}
