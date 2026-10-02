import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { consentTexts, currentConsent } from "@/lib/forms/consent";
import { NewsletterForm } from "./NewsletterForm";

/**
 * The newsletter form with its texts filled in on the server, so the browser
 * gets no translation library. Used in the footer and inside pages; `source`
 * records where people signed up.
 */
export async function NewsletterSignup({
  locale,
  source,
}: {
  locale: Locale;
  source: string;
}) {
  const forms = await getTranslations({ locale, namespace: "Forms" });
  return (
    <NewsletterForm
      locale={locale}
      source={source}
      labels={{
        title: forms("newsletter.title"),
        text: forms("newsletter.text"),
        email: forms("newsletter.email"),
        required: forms("required"),
        consent: consentTexts[currentConsent.newsletter][locale],
        submit: forms("newsletter.submit"),
        sending: forms("status.sending"),
        successTitle: forms("newsletter.successTitle"),
        successText: forms("newsletter.successText"),
        errorEmail: forms("errors.email"),
        errorConsent: forms("errors.consent"),
        errorOther: forms("status.unavailable"),
      }}
    />
  );
}
