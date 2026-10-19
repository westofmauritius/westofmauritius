import "server-only";
import { getTranslations } from "next-intl/server";
import { getPathname } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { site } from "../site";
import { renderEmail } from "./layout";
import { sendEmail } from "./send";

/**
 * Every transactional e-mail Soley sends. Texts are in messages/*.json
 * under "email", in the recipient's language.
 */

type Href = Parameters<typeof getPathname>[0]["href"];
const link = (href: Href, locale: Locale) =>
  `${site.url}${getPathname({ href, locale })}`;

async function send(
  tag: string,
  to: string,
  locale: Locale,
  build: (t: Awaited<ReturnType<typeof getTranslations<"email">>>) => {
    subject: string;
    greeting: string;
    paragraphs: string[];
    button?: { label: string; url: string };
  },
) {
  const t = await getTranslations({ locale, namespace: "email" });
  const content = build(t);
  const { html, text } = renderEmail({
    ...content,
    footer: [
      t("footer.independent"),
      t("footer.contact", { email: site.contactEmail }),
    ],
  });
  return sendEmail({ tag, to, subject: content.subject, html, text });
}

export function emailRequestReceived(
  to: string,
  locale: Locale,
  data: { name: string; reference: string },
) {
  return send("request-received", to, locale, (t) => ({
    subject: t("requestReceived.subject", { reference: data.reference }),
    greeting: t("greeting", { name: data.name }),
    paragraphs: [
      t("requestReceived.body1", { reference: data.reference }),
      t("requestReceived.body2"),
    ],
    button: {
      label: t("requestReceived.button"),
      url: link("/account", locale),
    },
  }));
}

export function emailAdminNewRequest(
  to: string,
  data: { reference: string; region: string; requestId: string },
) {
  return send("admin-new-request", to, "en", (t) => ({
    subject: t("adminNewRequest.subject", { reference: data.reference }),
    greeting: t("greetingTeam"),
    paragraphs: [
      t("adminNewRequest.body", {
        reference: data.reference,
        region: data.region,
      }),
    ],
    button: {
      label: t("adminNewRequest.button"),
      url: link(
        { pathname: "/admin/requests/[id]", params: { id: data.requestId } },
        "en",
      ),
    },
  }));
}

export function emailNewLead(
  to: string,
  locale: Locale,
  data: { company: string; region: string; assignmentId: string; bill: string },
) {
  return send("new-lead", to, locale, (t) => ({
    subject: t("newLead.subject", { region: data.region }),
    greeting: t("greeting", { name: data.company }),
    paragraphs: [
      t("newLead.body1", { region: data.region, bill: data.bill }),
      t("newLead.body2"),
    ],
    button: {
      label: t("newLead.button"),
      url: link(
        { pathname: "/portal/leads/[id]", params: { id: data.assignmentId } },
        locale,
      ),
    },
  }));
}

export function emailLeadReminder(
  to: string,
  locale: Locale,
  data: { company: string; assignmentId: string },
) {
  return send("lead-reminder", to, locale, (t) => ({
    subject: t("leadReminder.subject"),
    greeting: t("greeting", { name: data.company }),
    paragraphs: [t("leadReminder.body")],
    button: {
      label: t("newLead.button"),
      url: link(
        { pathname: "/portal/leads/[id]", params: { id: data.assignmentId } },
        locale,
      ),
    },
  }));
}

export function emailNewQuote(
  to: string,
  locale: Locale,
  data: {
    name: string;
    company: string;
    reference: string;
    requestId: string;
    count: number;
  },
) {
  return send("new-quote", to, locale, (t) => ({
    subject: t("newQuote.subject", { company: data.company }),
    greeting: t("greeting", { name: data.name }),
    paragraphs: [
      t("newQuote.body1", { company: data.company, reference: data.reference }),
      t("newQuote.body2", { count: data.count }),
    ],
    button: {
      label: t("newQuote.button"),
      url: link(
        { pathname: "/account/requests/[id]", params: { id: data.requestId } },
        locale,
      ),
    },
  }));
}

export function emailQuoteReminder(
  to: string,
  locale: Locale,
  data: { name: string; requestId: string },
) {
  return send("quote-reminder", to, locale, (t) => ({
    subject: t("quoteReminder.subject"),
    greeting: t("greeting", { name: data.name }),
    paragraphs: [t("quoteReminder.body")],
    button: {
      label: t("newQuote.button"),
      url: link(
        { pathname: "/account/requests/[id]", params: { id: data.requestId } },
        locale,
      ),
    },
  }));
}

export function emailQuoteOutcome(
  to: string,
  locale: Locale,
  data: {
    company: string;
    reference: string;
    won: boolean;
    assignmentId: string;
  },
) {
  return send(data.won ? "quote-won" : "quote-lost", to, locale, (t) => ({
    subject: data.won
      ? t("quoteWon.subject", { reference: data.reference })
      : t("quoteLost.subject", { reference: data.reference }),
    greeting: t("greeting", { name: data.company }),
    paragraphs: [data.won ? t("quoteWon.body") : t("quoteLost.body")],
    button: {
      label: t("newLead.button"),
      url: link(
        { pathname: "/portal/leads/[id]", params: { id: data.assignmentId } },
        locale,
      ),
    },
  }));
}

export function emailReviewInvite(
  to: string,
  locale: Locale,
  data: { name: string; company: string; requestId: string },
) {
  return send("review-invite", to, locale, (t) => ({
    subject: t("reviewInvite.subject", { company: data.company }),
    greeting: t("greeting", { name: data.name }),
    paragraphs: [t("reviewInvite.body", { company: data.company })],
    button: {
      label: t("reviewInvite.button"),
      url: link(
        { pathname: "/account/requests/[id]", params: { id: data.requestId } },
        locale,
      ),
    },
  }));
}

export function emailApplicationReceived(
  to: string,
  locale: Locale,
  data: { name: string; company: string },
) {
  return send("application-received", to, locale, (t) => ({
    subject: t("applicationReceived.subject"),
    greeting: t("greeting", { name: data.name }),
    paragraphs: [
      t("applicationReceived.body1", { company: data.company }),
      t("applicationReceived.body2"),
    ],
  }));
}

export function emailAdminNewApplication(
  to: string,
  data: { company: string; installerId: string },
) {
  return send("admin-new-application", to, "en", (t) => ({
    subject: t("adminNewApplication.subject", { company: data.company }),
    greeting: t("greetingTeam"),
    paragraphs: [t("adminNewApplication.body", { company: data.company })],
    button: {
      label: t("adminNewApplication.button"),
      url: link(
        {
          pathname: "/admin/installers/[id]",
          params: { id: data.installerId },
        },
        "en",
      ),
    },
  }));
}

export function emailInstallerDecision(
  to: string,
  locale: Locale,
  data: { name: string; company: string; approved: boolean },
) {
  return send(
    data.approved ? "installer-approved" : "installer-rejected",
    to,
    locale,
    (t) => ({
      subject: data.approved
        ? t("installerApproved.subject")
        : t("installerRejected.subject"),
      greeting: t("greeting", { name: data.name }),
      paragraphs: data.approved
        ? [t("installerApproved.body", { company: data.company })]
        : [t("installerRejected.body", { company: data.company })],
      button: data.approved
        ? {
            label: t("installerApproved.button"),
            url: link("/sign-in", locale),
          }
        : undefined,
    }),
  );
}

export function emailMagicLink(to: string, locale: Locale, url: string) {
  return send("magic-link", to, locale, (t) => ({
    subject: t("magicLink.subject"),
    greeting: t("magicLink.greeting"),
    paragraphs: [t("magicLink.body")],
    button: { label: t("magicLink.button"), url },
  }));
}

/** A message from the contact form, to the Soley team; replies go to the visitor. */
export function emailContactMessage(
  to: string,
  data: { name: string; email: string; message: string; locale: Locale },
) {
  const { html, text } = renderEmail({
    greeting: `Contact form (${data.locale}) from ${data.name} <${data.email}>`,
    paragraphs: data.message.split(/\n{2,}/),
    footer: ["Reply to this e-mail to answer the visitor."],
  });
  return sendEmail({
    tag: "contact",
    to,
    subject: `Soley contact: ${data.name}`,
    html,
    text,
    replyTo: data.email,
  });
}
