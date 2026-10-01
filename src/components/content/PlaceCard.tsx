import { getTranslations } from "next-intl/server";
import { Card } from "@/components/ui/Card";
import { Photo } from "@/components/ui/Photo";
import type { Place } from "@/lib/content/types";

type PlaceCardProps = {
  place: Place;
  /** Shown in the eyebrow next to the category; omit on the area's own page. */
  areaName?: string;
};

/** Card for a place in lists: photo, "Category · Area", name and summary. */
export async function PlaceCard({ place, areaName }: PlaceCardProps) {
  const t = await getTranslations();
  const category = t(`Categories.${place.category}.one`);
  return (
    <Card
      href={{ pathname: "/places/[slug]", params: { slug: place.slug } }}
      title={place.name}
      eyebrow={areaName ? `${category} · ${areaName}` : category}
      excerpt={place.summary}
      image={
        place.images[0] && (
          <Photo
            photo={place.images[0]}
            fallbackTone={place.placeholderTone}
            fallbackLabel={place.name}
            aspect="aspect-[4/3]"
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
        )
      }
      placeholderTone={place.placeholderTone}
      featured={place.featured}
      featuredLabel={t("Featured.label")}
      placeholder={place.placeholder}
      placeholderLabel={t("Placeholder.label")}
    />
  );
}
