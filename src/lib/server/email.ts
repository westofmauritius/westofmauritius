import "server-only";

type Email = {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
};

/**
 * Sends an e-mail through Resend's API (a plain fetch: no SDK to bundle).
 *
 * Without RESEND_API_KEY (local development, or before the account is set up)
 * the message is logged instead and `false` is returned. Sending is never
 * allowed to break a form: the submission is already saved by then.
 */
export async function sendEmail(email: Email): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const from =
    process.env.EMAIL_FROM ?? "West of Mauritius <onboarding@resend.dev>";
  if (!key) {
    console.info(
      `[email not sent: RESEND_API_KEY missing] To: ${email.to} — ${email.subject}`,
    );
    return false;
  }
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [email.to],
        subject: email.subject,
        text: email.text,
        ...(email.replyTo && { reply_to: email.replyTo }),
      }),
    });
    if (!response.ok) {
      console.error(
        `Resend error ${response.status}: ${await response.text()}`,
      );
      return false;
    }
    return true;
  } catch (error) {
    console.error("Resend request failed", error);
    return false;
  }
}

/** Where notifications about new leads and messages go. */
export const notifyAddress = () => process.env.LEAD_NOTIFY_EMAIL ?? "";
