import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ButtonLink, Container } from "@/components/ui";
import { Link } from "@/i18n/navigation";
import { resolveLocale } from "@/i18n/locale";
import { pageMetadata } from "@/lib/seo";
import { ClearDraft } from "./ClearDraft";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/get-quotes/thank-you">): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "quoteForm.thankYou" });
  return pageMetadata({
    locale,
    href: "/get-quotes/thank-you",
    title: t("metaTitle"),
    noindex: true,
  });
}

export default async function ThankYouPage({
  params,
  searchParams,
}: PageProps<"/[locale]/get-quotes/thank-you">) {
  await resolveLocale(params);
  const t = await getTranslations("quoteForm.thankYou");
  const { ref } = await searchParams;
  const reference =
    typeof ref === "string" && /^SOL-[0-9A-Z]{5}$/.test(ref) ? ref : null;
  return (
    <Container narrow className="py-12 sm:py-16">
      <ClearDraft />
      <div className="rounded-card bg-success-50 p-6 sm:p-8">
        <h1 className="text-3xl sm:text-4xl">{t("title")}</h1>
        {reference && (
          <p className="mt-3 text-lg font-semibold" data-testid="reference">
            {t("reference", { reference })}
          </p>
        )}
      </div>
      <h2 className="mt-10 text-2xl">{t("next")}</h2>
      <ol className="mt-4 space-y-4">
        {(["step1", "step2", "step3"] as const).map((key, index) => (
          <li key={key} className="flex gap-4">
            <span
              aria-hidden="true"
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-sun-400 font-bold"
            >
              {index + 1}
            </span>
            <p className="pt-1">{t(key)}</p>
          </li>
        ))}
      </ol>
      <div className="mt-8 flex flex-wrap items-center gap-4">
        <ButtonLink href="/account">{t("account")}</ButtonLink>
        <Link
          href="/grant-guide"
          className="inline-flex min-h-11 items-center font-semibold text-ocean-600 underline underline-offset-4"
        >
          {t("grant")}
        </Link>
      </div>
    </Container>
  );
}
