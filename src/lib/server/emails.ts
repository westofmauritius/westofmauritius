import "server-only";
import { getPathname } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { ContactData, LeadData } from "@/lib/forms/validation";
import { brandName, siteUrl } from "@/lib/site";
import { notifyAddress, sendEmail } from "./email";

/** Texts of the e-mails the site sends. Notifications to the owner are in English. */

export async function notifyNewLead(lead: LeadData) {
  const to = notifyAddress();
  if (!to) return;
  await sendEmail({
    to,
    replyTo: lead.email,
    subject: `New lead: ${lead.name} (${lead.budget}, ${lead.country})`,
    text: [
      `A new property enquiry arrived on ${brandName.en}.`,
      "",
      `Name:       ${lead.name}`,
      `E-mail:     ${lead.email}`,
      `Phone:      ${lead.phone || "—"}`,
      `Country:    ${lead.country}`,
      `Budget:     ${lead.budget}`,
      `Timeframe:  ${lead.timeframe}`,
      `Areas:      ${lead.areas.join(", ") || "—"}`,
      `Newsletter: ${lead.newsletter ? "yes" : "no"}`,
      `Language:   ${lead.locale}`,
      `Source:     ${lead.source || "—"}`,
      "",
      "Message:",
      lead.message || "—",
      "",
      `All leads: ${siteUrl}/admin/leads`,
    ].join("\n"),
  });
}

const leadReceipt: Record<
  Locale,
  { subject: string; body: (name: string) => string }
> = {
  en: {
    subject: "We received your enquiry",
    body: (name) =>
      `Hello ${name},\n\nThank you for telling us about your plans for the west coast of Mauritius. We have received your enquiry and will be in touch soon.\n\n${brandName.en}\n${siteUrl}/en`,
  },
  fr: {
    subject: "Nous avons bien reçu votre demande",
    body: (name) =>
      `Bonjour ${name},\n\nMerci de nous avoir fait part de votre projet sur la côte ouest de l’île Maurice. Nous avons bien reçu votre demande et reviendrons vers vous rapidement.\n\n${brandName.fr}\n${siteUrl}/fr`,
  },
};

/** A short receipt to the person who sent the enquiry, in their language. */
export async function sendLeadReceipt(lead: LeadData) {
  const text = leadReceipt[lead.locale];
  await sendEmail({
    to: lead.email,
    subject: text.subject,
    text: text.body(lead.name),
  });
}

export async function notifyNewContact(message: ContactData) {
  const to = notifyAddress();
  if (!to) return;
  await sendEmail({
    to,
    replyTo: message.email,
    subject: `Contact form (${message.topic}): ${message.name}`,
    text: [
      `From:     ${message.name} <${message.email}>`,
      `Topic:    ${message.topic}`,
      `Language: ${message.locale}`,
      "",
      message.message,
    ].join("\n"),
  });
}

const confirmTexts: Record<
  Locale,
  { subject: string; body: (link: string, unsubscribe: string) => string }
> = {
  en: {
    subject: "Please confirm your subscription",
    body: (link, unsubscribe) =>
      `Hello,\n\nPlease confirm that you want to receive the ${brandName.en} newsletter:\n${link}\n\nIf you did not sign up, simply ignore this e-mail.\n\nUnsubscribe at any time: ${unsubscribe}`,
  },
  fr: {
    subject: "Merci de confirmer votre inscription",
    body: (link, unsubscribe) =>
      `Bonjour,\n\nMerci de confirmer que vous souhaitez recevoir la newsletter d’${brandName.fr} :\n${link}\n\nSi vous ne vous êtes pas inscrit, ignorez simplement cet e-mail.\n\nDésabonnement à tout moment : ${unsubscribe}`,
  },
};

/** Double opt-in: the address is only used after the person clicks this link. */
export async function sendNewsletterConfirmation(
  email: string,
  token: string,
  locale: Locale,
) {
  const link = `${siteUrl}/api/newsletter/confirm?token=${encodeURIComponent(token)}&locale=${locale}`;
  const unsubscribe = `${siteUrl}/api/newsletter/unsubscribe?token=${encodeURIComponent(token)}&locale=${locale}`;
  const text = confirmTexts[locale];
  return sendEmail({
    to: email,
    subject: text.subject,
    text: text.body(link, unsubscribe),
  });
}

/** The page that tells the visitor how the confirm/unsubscribe link went. */
export function newsletterStatusUrl(locale: Locale, status: string) {
  return `${siteUrl}${getPathname({ href: "/newsletter", locale })}?status=${status}`;
}
