import { getTranslations } from "next-intl/server";
import { PlacesMap, type MapMarker } from "./PlacesMap";

type SiteMapProps = {
  center: { lat: number; lng: number };
  zoom: number;
  markers: MapMarker[];
  /** What the map shows, used in its accessible name ("Map of …"). */
  name: string;
  className?: string;
};

/** Server wrapper that gives the interactive map its translated texts. */
export async function SiteMap({
  center,
  zoom,
  markers,
  name,
  className,
}: SiteMapProps) {
  const t = await getTranslations("Map");
  return (
    <PlacesMap
      center={center}
      zoom={zoom}
      markers={markers}
      label={t("label", { name })}
      loadingText={t("loading")}
      gestureHelp={{
        touch: t("touchHelp"),
        desktop: t("desktopHelp"),
        mac: t("macHelp"),
      }}
      className={className}
    />
  );
}
