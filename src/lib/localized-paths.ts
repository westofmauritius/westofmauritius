import { routing, type Locale } from "@/i18n/routing";
import { translateCategorySlug } from "@/lib/guide-categories";

type Pathnames = Record<string, string | Partial<Record<Locale, string>>>;
const pathnames = routing.pathnames as Pathnames;

const template = (internal: string, locale: Locale) => {
  const value = pathnames[internal];
  return typeof value === "string" ? value : (value?.[locale] ?? internal);
};

/**
 * Translates a public URL path into another language without any content:
 * "/fr/regions/tamarin" (fr → en) → "/en/areas/tamarin", and guide categories
 * "/fr/guides/plages" → "/en/guides/beaches". Slugs that only content knows
 * (a guide's French URL) are kept as they are; the language switcher then
 * corrects them from the page's hreflang tags once the page has loaded.
 */
export function translatePath(path: string, from: Locale, to: Locale): string {
  const rest = path.replace(new RegExp(`^/${from}(?=/|$)`), "") || "/";
  for (const internal of Object.keys(pathnames)) {
    const names: string[] = [];
    const pattern = template(internal, from)
      .split("/")
      .map((part) => {
        const param = part.match(/^\[(\w+)\]$/);
        if (!param) return part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        names.push(param[1]);
        return "([^/]+)";
      })
      .join("/");
    const match = rest.match(new RegExp(`^${pattern}$`));
    if (!match) continue;
    let target = template(internal, to);
    names.forEach((name, i) => {
      const value =
        name === "category"
          ? translateCategorySlug(match[i + 1], from, to)
          : match[i + 1];
      target = target.replace(`[${name}]`, value);
    });
    return `/${to}${target === "/" ? "" : target}`;
  }
  return `/${to}`;
}
