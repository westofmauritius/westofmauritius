import { getPathname } from "@/i18n/pathname";
import type { Locale } from "@/i18n/routing";
import type { Place } from "@/lib/content/types";
import type { MapMarker } from "./PlacesMap";

/** A map marker linking to the place's page in the given language. */
export function placeMarker(place: Place, locale: Locale): MapMarker {
  return {
    id: place.slug,
    lat: place.location.lat,
    lng: place.location.lng,
    label: place.name,
    href: getPathname({
      href: { pathname: "/places/[slug]", params: { slug: place.slug } },
      locale,
    }),
    highlight: place.featured,
  };
}
