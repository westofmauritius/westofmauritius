import "server-only";

export type Email = {
  to: string;
  subject: string;
  /** Plain text version (always sent; many phones show it in previews). */
  text: string;
  html: string;
  /** A tag for the outbox and logs, e.g. "request-received". */
  tag: string;
};

export type SentEmail = Email & { sentAt: string };

// The development outbox: without a Resend key, e-mails are kept here (and
// printed to the server log) instead of being sent. The end-to-end tests
// read magic links from it through /api/dev/outbox.
const holder = globalThis as unknown as { __soleyOutbox?: SentEmail[] };
export const outbox = (): SentEmail[] => (holder.__soleyOutbox ??= []);

/**
 * Sends an e-mail through Resend's REST API. Failures are logged and
 * reported as `false`, never thrown: a form submission should not fail
 * because a notification could not be delivered.
 */
export async function sendEmail(email: Email): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    outbox().unshift({ ...email, sentAt: new Date().toISOString() });
    outbox().splice(200);
    if (process.env.NODE_ENV !== "test") {
      console.info(`[email:${email.tag}] to ${email.to}: ${email.subject}`);
    }
    return true;
  }
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM ?? "Soley <onboarding@resend.dev>",
        to: [email.to],
        subject: email.subject,
        text: email.text,
        html: email.html,
        tags: [{ name: "type", value: email.tag }],
      }),
    });
    if (!response.ok) {
      console.error(`[email:${email.tag}] Resend error ${response.status}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error(`[email:${email.tag}] failed`, error);
    return false;
  }
}
