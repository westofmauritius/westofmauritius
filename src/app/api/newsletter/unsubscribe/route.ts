import { routing, type Locale } from "@/i18n/routing";
import { newsletterStatusUrl } from "@/lib/server/emails";
import { getStore } from "@/lib/server/store";

/** One-click unsubscribe link from every newsletter e-mail. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") ?? "";
  const locale = (routing.locales as readonly string[]).includes(
    url.searchParams.get("locale") ?? "",
  )
    ? (url.searchParams.get("locale") as Locale)
    : routing.defaultLocale;
  const store = getStore();
  const ok = Boolean(token && store && (await store.unsubscribe(token)));
  return Response.redirect(
    newsletterStatusUrl(locale, ok ? "unsubscribed" : "invalid"),
    303,
  );
}
