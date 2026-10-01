"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import type { Map as MapLibreMap } from "maplibre-gl";
import { useEffect, useRef } from "react";

export type MapMarker = {
  id: string;
  lat: number;
  lng: number;
  label: string;
  /** Full path of the page the marker links to, e.g. /fr/lieux/x. */
  href: string;
  /** Highlighted markers are drawn in coral, the others in ocean blue. */
  highlight?: boolean;
};

type PlacesMapProps = {
  center: { lat: number; lng: number };
  zoom: number;
  markers: MapMarker[];
  /** Accessible name, e.g. "Map of Tamarin". */
  label: string;
  /** Translated help texts shown when someone tries to scroll the map. */
  gestureHelp: { touch: string; desktop: string; mac: string };
};

// Free vector map from OpenFreeMap (OpenStreetMap data). No API key and no
// tracking cookies. "Positron" is a quiet, light style that lets our markers
// stand out.
const MAP_STYLE = "https://tiles.openfreemap.org/styles/positron";

/**
 * Interactive map with a marker per place.
 *
 * Performance: the map library (~250 kB) is only downloaded when the map is
 * about to scroll into view, so pages without a visible map stay fast.
 * Usability: "cooperative gestures" means one finger / the scroll wheel keep
 * scrolling the page; the map moves with two fingers or Ctrl + scroll.
 */
export function PlacesMap({
  center,
  zoom,
  markers,
  label,
  gestureHelp,
}: PlacesMapProps) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = container.current;
    if (!element) return;

    let map: MapLibreMap | undefined;
    let cancelled = false;

    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        const maplibregl = await import("maplibre-gl");
        if (cancelled) return;
        // Our own copy of the worker file (see scripts/copy-maplibre-worker.mjs).
        maplibregl.setWorkerUrl(
          `/vendor/maplibre/${maplibregl.getVersion()}/maplibre-gl-worker.mjs`,
        );

        const instance = new maplibregl.Map({
          container: element,
          style: MAP_STYLE,
          center: [center.lng, center.lat],
          zoom,
          cooperativeGestures: true,
          attributionControl: { compact: true },
          locale: {
            "CooperativeGesturesHandler.MobileHelpText": gestureHelp.touch,
            "CooperativeGesturesHandler.WindowsHelpText": gestureHelp.desktop,
            "CooperativeGesturesHandler.MacHelpText": gestureHelp.mac,
          },
        });
        map = instance;
        instance.addControl(
          new maplibregl.NavigationControl({ showCompass: false }),
          "top-right",
        );
        instance.once("load", () => {
          // Tint the sea in the site's lagoon colour instead of Positron's grey.
          if (instance.getLayer("water")) {
            instance.setPaintProperty("water", "fill-color", "#d5f4f1");
          }
          // Start with the attribution folded into its (i) button, so it does
          // not cover small maps on phones. It opens on tap.
          element
            .querySelector(".maplibregl-ctrl-attrib.maplibregl-compact-show")
            ?.classList.remove("maplibregl-compact-show");
        });

        for (const marker of markers) {
          new maplibregl.Marker({
            element: createMarkerElement(marker),
            anchor: "bottom",
          })
            .setLngLat([marker.lng, marker.lat])
            .addTo(instance);
        }

        // With several markers, zoom so that all of them are visible.
        if (markers.length > 1) {
          const bounds = new maplibregl.LngLatBounds();
          for (const m of markers) bounds.extend([m.lng, m.lat]);
          instance.fitBounds(bounds, { padding: 60, maxZoom: 14, duration: 0 });
        }
      },
      { rootMargin: "300px" },
    );

    observer.observe(element);
    return () => {
      cancelled = true;
      observer.disconnect();
      map?.remove();
    };
  }, [center.lat, center.lng, zoom, markers, gestureHelp]);

  return (
    // Fills MapFrame, which shows the "loading" text underneath until the
    // map has drawn over it.
    <div className="absolute inset-0">
      <div
        ref={container}
        role="region"
        aria-label={label}
        // Full size via h-full/w-full, not absolute positioning: MapLibre's
        // own CSS sets position: relative on this element.
        className="h-full w-full"
      />
    </div>
  );
}

/**
 * A marker is a real link (keyboard and screen-reader friendly) with a pin and
 * a name label that appears on hover or focus.
 */
function createMarkerElement(marker: MapMarker): HTMLElement {
  const link = document.createElement("a");
  link.href = marker.href;
  link.className = "map-marker group";
  link.setAttribute("aria-label", marker.label);
  link.dataset.highlight = String(Boolean(marker.highlight));

  const pin = document.createElement("span");
  pin.className = "map-marker-pin";
  const name = document.createElement("span");
  name.className = "map-marker-label";
  name.textContent = marker.label;

  link.append(name, pin);
  return link;
}
