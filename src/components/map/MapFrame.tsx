"use client";

import dynamic from "next/dynamic";
import { cn } from "@/lib/cn";
import type { MapMarker } from "./PlacesMap";

// The map component (and MapLibre with it) is loaded in the browser only.
// Without ssr: false, the server bundle on Cloudflare would carry over 1 MB
// of map code it never runs.
const PlacesMap = dynamic(
  () => import("./PlacesMap").then((m) => m.PlacesMap),
  { ssr: false },
);

type MapFrameProps = {
  center: { lat: number; lng: number };
  zoom: number;
  markers: MapMarker[];
  label: string;
  loadingText: string;
  gestureHelp: { touch: string; desktop: string; mac: string };
  className?: string;
};

/** The map's box: fixed size from the page, a loading note under the map. */
export function MapFrame({ className, loadingText, ...map }: MapFrameProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-sand-50",
        className,
      )}
    >
      <p className="absolute inset-0 flex items-center justify-center text-small text-ink-muted">
        {loadingText}
      </p>
      <PlacesMap {...map} />
    </div>
  );
}
