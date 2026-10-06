"use client";

import { useRef, useState } from "react";
import { ResponsiveImage } from "@/components/ui/ResponsiveImage";
import { cn } from "@/lib/cn";
import type { Photo } from "@/lib/content/types";

type GalleryLabels = {
  /** e.g. "Open photo {n} of {total}" — {n} and {total} are filled in here. */
  open: string;
  close: string;
  previous: string;
  next: string;
};

type PlaceGalleryProps = {
  photos: Photo[];
  labels: GalleryLabels;
};

const fill = (text: string, values: Record<string, string | number>) =>
  text.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ""));

/**
 * Main photo plus thumbnails; any of them opens a full-screen viewer.
 *
 * The viewer is a native <dialog>: the browser handles focus trapping,
 * Escape to close and returning focus afterwards. We add arrow keys and
 * previous/next buttons.
 */
export function PlaceGallery({ photos, labels }: PlaceGalleryProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [current, setCurrent] = useState(0);
  // The full-size photo is only rendered while the viewer is open: an <img>
  // in the server HTML would make the browser (and React's preloading)
  // download the large original on every visit.
  const [isOpen, setIsOpen] = useState(false);
  const total = photos.length;

  const open = (index: number) => {
    setCurrent(index);
    setIsOpen(true);
    dialog.current?.showModal();
  };
  const step = (delta: number) => setCurrent((i) => (i + delta + total) % total);

  const [main, ...rest] = photos;
  const photo = photos[current];

  return (
    <>
      <button
        type="button"
        onClick={() => open(0)}
        aria-label={fill(labels.open, { n: 1, total })}
        className="group relative block aspect-[4/3] w-full overflow-hidden rounded-2xl bg-sand-100 sm:aspect-[16/9] lg:aspect-[21/9]"
      >
        <ResponsiveImage
          src={main.src}
          alt={main.alt}
          priority
          sizes="100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
        />
      </button>

      {rest.length > 0 && (
        <ul className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {rest.map((p, i) => (
            <li key={p.src}>
              <button
                type="button"
                onClick={() => open(i + 1)}
                aria-label={fill(labels.open, { n: i + 2, total })}
                className="group relative block aspect-[4/3] w-full overflow-hidden rounded-2xl bg-sand-100"
              >
                <ResponsiveImage
                  src={p.src}
                  alt={p.alt}
                  sizes="(min-width: 1024px) 16vw, (min-width: 640px) 25vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                />
              </button>
            </li>
          ))}
        </ul>
      )}

      <dialog
        onClose={() => setIsOpen(false)}
        ref={dialog}
        aria-label={photo.alt}
        // Close when the dark backdrop (the dialog element itself) is clicked.
        onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") step(1);
          if (e.key === "ArrowLeft") step(-1);
        }}
        className="m-auto h-dvh max-h-none w-screen max-w-none bg-transparent p-0 backdrop:bg-ocean-950/90"
      >
        <div className="pointer-events-none flex h-full flex-col items-center justify-center gap-4 p-4 sm:p-10">
          <figure className="pointer-events-auto flex max-h-full w-full max-w-6xl flex-col items-center">
            {/* A plain <img>: the viewer shows the full photo at its own size. */}
            {isOpen && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photo.src}
                alt={photo.alt}
                className="max-h-[78dvh] w-auto max-w-full rounded-2xl object-contain"
              />
            )}
            <figcaption className="mt-3 text-center text-small text-ocean-100">
              {photo.alt}
              <span className="ml-3 text-ocean-300 tabular-nums">
                {current + 1} / {total}
              </span>
            </figcaption>
          </figure>
          <div className="pointer-events-auto flex gap-3">
            {total > 1 && (
              <GalleryButton onClick={() => step(-1)} label={labels.previous}>
                ←
              </GalleryButton>
            )}
            <GalleryButton onClick={() => dialog.current?.close()} label={labels.close} autoFocus>
              ✕
            </GalleryButton>
            {total > 1 && (
              <GalleryButton onClick={() => step(1)} label={labels.next}>
                →
              </GalleryButton>
            )}
          </div>
        </div>
      </dialog>
    </>
  );
}

function GalleryButton({
  onClick,
  label,
  autoFocus,
  children,
}: {
  onClick: () => void;
  label: string;
  autoFocus?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      autoFocus={autoFocus}
      className={cn(
        "flex size-12 items-center justify-center rounded-full bg-white/10 text-lg text-white transition-colors hover:bg-white/20",
      )}
    >
      <span aria-hidden="true">{children}</span>
    </button>
  );
}
