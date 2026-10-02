import { getTranslations } from "next-intl/server";
import { CostsTable } from "@/components/content/CostsTable";
import { EnquiryCta } from "@/components/content/EnquiryCta";
import { Faq } from "@/components/content/Faq";
import { NewsletterSignup } from "@/components/forms/NewsletterSignup";
import { Container } from "@/components/ui/Container";
import type { Locale } from "@/i18n/routing";
import type { Area } from "@/lib/content/types";
import { longDate } from "@/lib/dates";
import { inPlace } from "@/lib/place-names";

/**
 * "Living in Tamarin": the part of an area page for people thinking of
 * moving. Built to answer the question first (short answer), then the
 * detail, then the figures with their sources, then common questions, and
 * finally the two next steps: a personal shortlist or the newsletter.
 *
 * While the section is a placeholder it says so at the top, its text is
 * kept out of search snippets (data-nosnippet) and no FAQ data is emitted.
 */
export async function AreaLivingSection({
  area,
  locale,
}: {
  area: Area;
  locale: Locale;
}) {
  const t = await getTranslations({ locale, namespace: "AreaLiving" });
  const living = area.living;
  const name = inPlace(area.name, locale);
  const date = longDate(locale);

  return (
    <section
      id="living"
      aria-labelledby="living-title"
      className="scroll-mt-20 border-t border-line py-16 sm:py-24"
      {...(living.placeholder && { "data-nosnippet": true })}
    >
      <Container size="wide">
        <div className="max-w-3xl">
          <p className="mb-4 eyebrow text-coral-600">{t("eyebrow")}</p>
          <h2 id="living-title" className="text-display-2">
            {t("title", { name })}
          </h2>
          <p className="mt-5 lead text-ink-muted">{t("intro", { name })}</p>
          {living.updatedAt && (
            <p className="mt-3 text-sm text-ink-muted">
              {t("updated", { date: date(living.updatedAt) })}
            </p>
          )}
          {living.placeholder && (
            <p className="mt-6 rounded-sm border border-dashed border-coral-400 bg-coral-50 px-4 py-3 text-sm text-coral-700">
              {t("placeholder")}
            </p>
          )}
        </div>

        {living.shortAnswer && (
          <div className="mt-12 max-w-3xl border-l-4 border-lagoon-500 bg-lagoon-50 px-6 py-6 sm:px-8">
            <h3 className="eyebrow text-lagoon-800">{t("shortAnswer")}</h3>
            <p className="mt-3 font-display text-2xl leading-snug">
              {living.shortAnswer}
            </p>
          </div>
        )}

        <div className="mt-14 grid gap-14 lg:grid-cols-[7fr_5fr] lg:gap-16">
          <div className="min-w-0 space-y-14">
            {living.livingHere.length > 0 && (
              <div>
                <h3 className="text-display-3">{t("livingHere")}</h3>
                <div className="mt-5 space-y-4 leading-relaxed">
                  {living.livingHere.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </div>
            )}

            {(living.pros.length > 0 || living.cons.length > 0) && (
              <div className="grid gap-10 sm:grid-cols-2">
                <ProsCons
                  title={t("pros")}
                  items={living.pros}
                  mark="✓"
                  markClass="bg-lagoon-100 text-lagoon-800"
                />
                <ProsCons
                  title={t("cons")}
                  items={living.cons}
                  mark="!"
                  markClass="bg-coral-100 text-coral-700"
                />
              </div>
            )}

            {living.costs.length > 0 && (
              <div>
                <h3 className="text-display-3">{t("costsTitle")}</h3>
                <div className="mt-5">
                  <CostsTable
                    rows={living.costs}
                    caption={t("costsCaption", { name })}
                    locale={locale}
                  />
                </div>
              </div>
            )}

            <dl className="grid gap-8 sm:grid-cols-3">
              {(
                [
                  ["schools", living.schools],
                  ["healthcare", living.healthcare],
                  ["commuting", living.commuting],
                ] as const
              )
                .filter(([, text]) => text)
                .map(([key, text]) => (
                  <div key={key} className="border-t border-ink/20 pt-4">
                    <dt className="font-display text-xl">{t(key)}</dt>
                    <dd className="mt-2 text-sm leading-relaxed text-ink-muted">
                      {text}
                    </dd>
                  </div>
                ))}
            </dl>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <EnquiryCta
              area={{ slug: area.slug, name: area.name }}
              intent="move"
              position={`area-living-${area.slug}`}
              tone="coral"
            />
            <div className="rounded-sm bg-ocean-900 p-7">
              <NewsletterSignup locale={locale} source={`area-${area.slug}`} />
            </div>
          </aside>
        </div>

        {living.faqs.length > 0 && (
          <div className="mt-20 max-w-3xl">
            <h3 className="text-display-3">{t("faqTitle", { name })}</h3>
            <Faq items={living.faqs} className="mt-8" />
          </div>
        )}
      </Container>
    </section>
  );
}

function ProsCons({
  title,
  items,
  mark,
  markClass,
}: {
  title: string;
  items: string[];
  mark: string;
  markClass: string;
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <h3 className="font-display text-2xl">{title}</h3>
      <ul className="mt-4 space-y-3">
        {items.map((item, i) => (
          <li key={i} className="flex gap-3 leading-relaxed">
            <span
              aria-hidden="true"
              className={`mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${markClass}`}
            >
              {mark}
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
