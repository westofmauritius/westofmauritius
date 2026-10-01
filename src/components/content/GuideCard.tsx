import { getLocale, getTranslations } from "next-intl/server";
import { Card } from "@/components/ui/Card";
import { Photo } from "@/components/ui/Photo";
import type { Locale } from "@/i18n/routing";
import type { Guide } from "@/lib/content/types";
import { guideCategories } from "@/lib/guide-categories";

/** Card for a guide in lists: photo, category, title and intro. */
export async function GuideCard({ guide }: { guide: Guide }) {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations();
  return (
    <Card
      href={{
        pathname: "/guides/[category]/[slug]",
        params: { category: guideCategories[guide.category].slug[locale], slug: guide.slug },
      }}
      title={guide.title}
      eyebrow={t(`GuideCategories.${guide.category}.title`)}
      image={
        guide.hero && (
          <Photo
            photo={guide.hero}
            fallbackTone={guide.placeholderTone}
            fallbackLabel={guide.title}
            aspect="aspect-[4/3]"
            sizes="(min-width: 1024px) 25vw, 50vw"
          />
        )
      }
      placeholderTone={guide.placeholderTone}
      placeholder={guide.placeholder}
      placeholderLabel={t("Placeholder.label")}
    />
  );
}
