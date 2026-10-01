"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { cn } from "@/lib/cn";
import type { Photo } from "@/lib/content/types";

type GalleryLabels = {
  /** e.g. "Open photo {n} of {total}" — {n} and {total} are filled in here. */
  open: string;
  close: string;
  previous: string;
  next: string;
  /** e.g. "Photo: {credit}" */
  photoBy: string;
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
  const total = photos.length;

  const open = (index: number) => {
    setCurrent(index);
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
        className="group relative block aspect-[4/3] w-full overflow-hidden rounded-sm bg-sand-100 sm:aspect-[16/9] lg:aspect-[21/9]"
      >
        <Image
          src={main.src}
          alt={main.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
        />
        {main.credit && (
          <span className="absolute right-2 bottom-2 rounded-sm bg-black/35 px-2 py-0.5 text-[0.625rem] text-white">
            {fill(labels.photoBy, { credit: main.credit })}
          </span>
        )}
      </button>

      {rest.length > 0 && (
        <ul className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {rest.map((p, i) => (
            <li key={p.src}>
              <button
                type="button"
                onClick={() => open(i + 1)}
                aria-label={fill(labels.open, { n: i + 2, total })}
                className="group relative block aspect-[4/3] w-full overflow-hidden rounded-sm bg-sand-100"
              >
                <Image
                  src={p.src}
                  alt={p.alt}
                  fill
                  sizes="(min-width: 1024px) 16vw, (min-width: 640px) 25vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                />
              </button>
            </li>
          ))}
        </ul>
      )}

      <dialog
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.src}
              alt={photo.alt}
              className="max-h-[78dvh] w-auto max-w-full rounded-sm object-contain"
            />
            <figcaption className="mt-3 text-center text-sm text-ocean-100">
              {photo.alt}
              {photo.credit && ` · ${fill(labels.photoBy, { credit: photo.credit })}`}
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
