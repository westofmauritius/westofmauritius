import { getLocale, getTranslations } from "next-intl/server";
import { Photo } from "@/components/ui/Photo";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { Link } from "@/i18n/Link";
import type { Locale } from "@/i18n/routing";
import { getGuides } from "@/lib/content/guides";
import { guideCategories, guideCategoryKeys } from "@/lib/guide-categories";

/**
 * The guide themes as tall tiles. Scrolls sideways on phones (with snap
 * points), one row on large screens.
 *
 * Each tile borrows the main photo of a real (non-placeholder) guide in its
 * theme; themes without one keep the gradient.
 */
export async function GuideThemes() {
  const locale = (await getLocale()) as Locale;
  const [t, guides] = await Promise.all([
    getTranslations("GuideCategories"),
    getGuides(locale),
  ]);
  const photoFor = (key: string) =>
    guides.find((g) => g.category === key && !g.placeholder && g.hero)?.hero ??
    null;
  return (
    <ul className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-6">
      {guideCategoryKeys.map((key) => (
        <li key={key} className="w-64 shrink-0 snap-start sm:w-auto">
          <Link
            href={{
              pathname: "/guides/[category]",
              params: { category: guideCategories[key].slug[locale] },
            }}
            className="group block"
          >
            <div className="relative overflow-hidden rounded-sm">
              {photoFor(key) ? (
                <Photo
                  photo={photoFor(key)}
                  fallbackTone={guideCategories[key].tone}
                  fallbackLabel=""
                  aspect="aspect-[3/4]"
                  sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 256px"
                  className="transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
              ) : (
                <PlaceholderImage
                  tone={guideCategories[key].tone}
                  aspect="aspect-[3/4]"
                  className="transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
              )}
              {/* Dark fade behind the title keeps white text readable on light images. */}
              <span className="absolute inset-x-0 top-0 bg-linear-to-b from-ocean-950/70 to-transparent p-5 pb-14 font-display text-3xl text-white">
                {t(`${key}.title`)}
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">{t(`${key}.intro`)}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
