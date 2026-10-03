import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { longDate } from "@/lib/dates";
import type { Source } from "@/lib/content/types";
import { cn } from "@/lib/cn";

/**
 * The list of sources at the end of a page: what the facts were checked
 * against, by whom it is published and when it was checked. Renders nothing
 * when an entry has no sources yet.
 */
export async function Sources({
  sources,
  locale,
  className,
}: {
  sources: Source[];
  locale: Locale;
  className?: string;
}) {
  if (sources.length === 0) return null;
  const t = await getTranslations({ locale, namespace: "Sources" });
  const date = longDate(locale);

  return (
    <section
      aria-labelledby="sources-title"
      className={cn("border-t border-line pt-8", className)}
    >
      <h2 id="sources-title" className="eyebrow text-ink-muted">
        {t("title")}
      </h2>
      <p className="mt-3 text-sm text-ink-muted">{t("intro")}</p>
      <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm marker:text-ink-muted">
        {sources.map((source) => (
          <li key={source.url}>
            <a
              href={source.url}
              className="underline decoration-line underline-offset-4 hover:decoration-ink"
            >
              {source.title}
            </a>
            {source.publisher && (
              <span className="text-ink-muted"> · {source.publisher}</span>
            )}
            {source.checkedAt && (
              <span className="text-ink-muted">
                {" "}
                ({t("checked", {
                  date: date(source.checkedAt),
                })})
              </span>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
