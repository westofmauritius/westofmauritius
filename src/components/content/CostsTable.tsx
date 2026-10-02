import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import type { CostRow } from "@/lib/content/types";
import { longDate } from "@/lib/dates";

/**
 * Typical living costs. Every amount carries the date it was checked and its
 * source; rows without an amount say so plainly instead of guessing.
 * On phones each row becomes a small card, so nothing scrolls sideways.
 */
export async function CostsTable({
  rows,
  caption,
  locale,
}: {
  rows: CostRow[];
  caption: string;
  locale: Locale;
}) {
  const t = await getTranslations({ locale, namespace: "AreaLiving" });
  const date = longDate(locale);
  return (
    <table className="w-full text-left text-sm">
      <caption className="mb-4 text-left text-ink-muted">{caption}</caption>
      <thead className="sr-only sm:not-sr-only">
        <tr className="border-b border-ink/20 text-xs tracking-wide text-ink-muted uppercase">
          <th scope="col" className="py-3 pr-4 font-medium">
            {t("costItem")}
          </th>
          <th scope="col" className="py-3 pr-4 font-medium">
            {t("costAmount")}
          </th>
          <th scope="col" className="py-3 pr-4 font-medium">
            {t("costChecked")}
          </th>
          <th scope="col" className="py-3 font-medium">
            {t("costSource")}
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr
            key={row.item}
            className="grid grid-cols-2 gap-x-4 gap-y-1 border-b border-line py-4 sm:table-row sm:py-0"
          >
            <th
              scope="row"
              className="col-span-2 font-medium sm:py-4 sm:pr-4 sm:align-top"
            >
              {row.item}
            </th>
            <td className="sm:py-4 sm:pr-4 sm:align-top">
              {row.amount || (
                <span className="text-ink-muted italic">
                  {t("notConfirmed")}
                </span>
              )}
            </td>
            <td className="text-ink-muted sm:py-4 sm:pr-4 sm:align-top">
              {row.checkedAt ? date(row.checkedAt) : ""}
            </td>
            <td className="col-span-2 text-ink-muted sm:py-4 sm:align-top">
              {row.sourceUrl ? (
                <a
                  href={row.sourceUrl}
                  className="underline decoration-line underline-offset-4 hover:text-ink"
                >
                  {row.sourceTitle || new URL(row.sourceUrl).hostname}
                </a>
              ) : (
                row.sourceTitle
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
