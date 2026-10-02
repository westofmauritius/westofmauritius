import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { consentTexts, currentConsent } from "@/lib/forms/consent";
import { communityRoles } from "@/lib/forms/options";
import { WhatsappForm } from "./WhatsappForm";

/** The WhatsApp group form with its texts filled in on the server. */
export async function WhatsappSignup({
  locale,
  source,
}: {
  locale: Locale;
  source: string;
}) {
  const t = await getTranslations({ locale, namespace: "Forms" });
  return (
    <WhatsappForm
      locale={locale}
      source={source}
      labels={{
        name: t("whatsapp.name"),
        phone: t("whatsapp.phone"),
        phoneHint: t("whatsapp.phoneHint"),
        role: t("whatsapp.role"),
        roles: communityRoles.map((value) => ({
          value,
          label: t(`whatsapp.roles.${value}`),
        })),
        required: t("required"),
        consent: consentTexts[currentConsent.whatsapp][locale],
        submit: t("whatsapp.submit"),
        sending: t("status.sending"),
        successTitle: t("whatsapp.successTitle"),
        successText: t("whatsapp.successText"),
        errorRequired: t("errors.required"),
        errorPhone: t("errors.phoneInvalid"),
        errorRole: t("errors.invalid"),
        errorConsent: t("errors.consent"),
        errorOther: t("status.unavailable"),
      }}
    />
  );
}
