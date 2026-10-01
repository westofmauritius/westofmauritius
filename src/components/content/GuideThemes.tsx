import { getLocale, getTranslations } from "next-intl/server";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { Link } from "@/i18n/Link";
import type { Locale } from "@/i18n/routing";
import { guideCategories, guideCategoryKeys } from "@/lib/guide-categories";

/**
 * The five guide themes as tall tiles. Scrolls sideways on phones (with
 * snap points), a row of five on large screens.
 */
export async function GuideThemes() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("GuideCategories");
  return (
    <ul className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-5">
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
              <PlaceholderImage
                tone={guideCategories[key].tone}
                aspect="aspect-[3/4]"
                className="transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
              {/* Dark fade behind the title keeps white text readable on light images. */}
              <span className="absolute inset-x-0 top-0 bg-linear-to-b from-ocean-950/55 to-transparent p-5 pb-12 font-display text-3xl text-white">
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
