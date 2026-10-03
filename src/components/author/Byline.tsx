import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/Link";
import type { Locale } from "@/i18n/routing";
import { longDate } from "@/lib/dates";
import { getAuthor } from "@/lib/content/author";
import { cn } from "@/lib/cn";
import { AuthorAvatar } from "./AuthorAvatar";

type BylineProps = {
  locale: Locale;
  publishedAt: string | null;
  updatedAt: string | null;
  align?: "center" | "start";
  className?: string;
};

/**
 * "By Olivier, Mauritian … Published … · Last updated …" under an article
 * title. Who wrote a page, and how fresh it is, are the first things readers
 * and search engines look for when deciding whether to trust it.
 */
export async function Byline({
  locale,
  publishedAt,
  updatedAt,
  align = "start",
  className,
}: BylineProps) {
  const [author, t] = await Promise.all([
    getAuthor(locale),
    getTranslations({ locale, namespace: "Author" }),
  ]);
  const date = longDate(locale);
  // "Last updated" always shows: the update date, or else the publish date.
  const lastUpdated = updatedAt ?? publishedAt;

  return (
    <div
      className={cn(
        "flex items-center gap-3 text-left text-sm",
        align === "center" && "justify-center",
        className,
      )}
    >
      <AuthorAvatar author={author} size={44} />
      <div>
        <p>
          {t.rich("by", {
            name: author.name,
            link: (chunks) => (
              <Link
                href="/about/olivier"
                rel="author"
                className="font-medium text-ink underline decoration-line underline-offset-4 hover:decoration-ink"
              >
                {chunks}
              </Link>
            ),
          })}
          {author.role && (
            <span className="text-ink-muted"> · {author.role}</span>
          )}
        </p>
        <p className="text-ink-muted">
          {publishedAt && (
            <>
              {t("published", {
                date: date(publishedAt),
              })}
              {" · "}
            </>
          )}
          {lastUpdated && (
            <time dateTime={lastUpdated}>
              {t("updated", { date: date(lastUpdated) })}
            </time>
          )}
        </p>
      </div>
    </div>
  );
}
