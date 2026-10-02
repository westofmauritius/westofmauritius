import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import type { LatLng } from "@/lib/content/types";
import { inPlace } from "@/lib/place-names";
import { SunsetClock } from "./SunsetClock";

/** Tonight's sunset at a place, with the texts filled in on the server. */
export async function SunsetNow({
  place,
  location,
  locale,
  spot = false,
  className,
}: {
  place: string;
  /** A beach or viewpoint ("at Tamarin Bay") rather than a village ("in"). */
  spot?: boolean;
  location: LatLng;
  locale: Locale;
  className?: string;
}) {
  const t = await getTranslations({ locale, namespace: "Sunset" });
  const name = inPlace(place, locale);
  return (
    <SunsetClock
      lat={location.lat}
      lng={location.lng}
      tonight={t(spot ? "tonightAt" : "tonight", {
        place: name,
        time: "{time}",
      })}
      tomorrow={t(spot ? "tomorrowAt" : "tomorrow", {
        place: name,
        time: "{time}",
      })}
      golden={t("golden", { time: "{time}" })}
      className={className}
    />
  );
}
