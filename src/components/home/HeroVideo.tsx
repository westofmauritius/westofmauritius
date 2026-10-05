"use client";

import { useEffect, useRef, useState } from "react";
import type { HeroVideoSource } from "@/lib/hero-video";

type Props = {
  sources: HeroVideoSource[];
  small?: HeroVideoSource[];
  /** The hero photo, shown until the video plays (and instead of it). */
  poster: string;
  labels: { pause: string; play: string };
};

type NetworkInformation = { saveData?: boolean; effectiveType?: string };

/** Whether this visit should get the video at all. */
function videoAllowed() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    return false;
  const connection = (
    navigator as Navigator & { connection?: NetworkInformation }
  ).connection;
  if (connection?.saveData) return false;
  if (
    connection?.effectiveType &&
    /(^|-)(2g|3g)$/.test(connection.effectiveType)
  ) {
    return false;
  }
  return true;
}

/**
 * The homepage hero's silent, looping background video.
 *
 * Cinematic but never in the way:
 * - The hero photo underneath is the poster and the page's main image; the
 *   video only starts loading once the page has finished loading and the
 *   browser is idle, so it never delays the first screen.
 * - Nothing is fetched on slow connections, with data saver on or when the
 *   visitor asks for less motion: the photo simply stays.
 * - It plays only while the hero is on screen and the tab is visible.
 * - It fades in once it is actually playing; on any error the photo stays.
 * - A pause button (WCAG 2.2.2: moving content that starts by itself must
 *   be possible to stop), remembered for the visit.
 */
export function HeroVideo({ sources, small, poster, labels }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [load, setLoad] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);

  // Decide, then wait for the page to be fully loaded and the browser idle.
  useEffect(() => {
    if (!videoAllowed()) return;
    let idle = 0;
    const start = () => {
      const ric =
        window.requestIdleCallback ??
        ((cb: () => void) => window.setTimeout(cb, 1500));
      idle = ric(
        () => {
          // A pause chosen earlier in this visit is kept.
          try {
            setPaused(sessionStorage.getItem("hero-video") === "paused");
          } catch {}
          setLoad(true);
        },
        { timeout: 4000 },
      );
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => {
      window.removeEventListener("load", start);
      (window.cancelIdleCallback ?? window.clearTimeout)(idle);
    };
  }, []);

  // Play only while visible on screen and not paused by the visitor.
  useEffect(() => {
    const video = ref.current;
    if (!load || !video) return;
    let onScreen = false;
    const sync = () => {
      if (onScreen && !document.hidden && !paused) video.play().catch(() => {});
      else video.pause();
    };
    const observer = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      sync();
    });
    observer.observe(video);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [load, paused]);

  if (!load) return null;
  const narrow = small && window.matchMedia("(max-width: 767px)").matches;
  const list = narrow ? small : sources;

  const toggle = () => {
    const next = !paused;
    setPaused(next);
    try {
      sessionStorage.setItem("hero-video", next ? "paused" : "playing");
    } catch {}
  };

  return (
    <>
      <div className="absolute inset-0 -z-10 overflow-hidden lg:left-[44%]">
        <video
          ref={ref}
          muted
          loop
          playsInline
          preload="auto"
          poster={poster}
          aria-hidden="true"
          tabIndex={-1}
          disablePictureInPicture
          onPlaying={() => setPlaying(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
            playing ? "opacity-100" : "opacity-0"
          }`}
        >
          {list.map((source, i) => (
            <source
              key={source.src}
              src={source.src}
              type={source.type}
              // The last source failing means none could play: keep the photo.
              onError={i === list.length - 1 ? () => setLoad(false) : undefined}
            />
          ))}
        </video>
      </div>
      {(playing || paused) && (
        <button
          type="button"
          onClick={toggle}
          className="absolute right-4 bottom-4 z-20 flex size-11 items-center justify-center rounded-full bg-hero/70 text-white backdrop-blur-sm transition-colors hover:bg-hero/90"
        >
          <span className="sr-only">{paused ? labels.play : labels.pause}</span>
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="size-5 fill-current"
          >
            {paused ? (
              <path d="M8 5v14l11-7z" />
            ) : (
              <path d="M7 5h4v14H7zM13 5h4v14h-4z" />
            )}
          </svg>
        </button>
      )}
    </>
  );
}
