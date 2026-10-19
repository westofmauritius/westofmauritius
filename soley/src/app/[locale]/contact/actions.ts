"use server";

import type { FormState } from "@/lib/actions/form-state";
import { emailContactMessage } from "@/lib/email/templates";
import { safeLocale } from "@/lib/i18n-server";
import { clientIp } from "@/lib/security/client-ip";
import { withinRateLimit } from "@/lib/security/rate-limit";
import { verifyTurnstile } from "@/lib/security/turnstile";
import { site } from "@/lib/site";
import { fieldErrors } from "@/lib/validation/common";
import { contactSchema } from "@/lib/validation/contact";

export async function sendContactMessage(
  localeArg: string,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const locale = safeLocale(localeArg);
  const ip = await clientIp();
  const token = formData.get("cf-turnstile-response");
  if (
    !(await verifyTurnstile(typeof token === "string" ? token : undefined, ip))
  ) {
    return { status: "error", message: "captcha" };
  }
  const parsed = contactSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return { status: "error", errors: fieldErrors(parsed.error) };
  if (!(await withinRateLimit("contact", [ip, parsed.data.email]))) {
    return { status: "error", message: "rateLimited" };
  }
  const to = process.env.ADMIN_NOTIFICATION_EMAIL || site.contactEmail;
  const sent = await emailContactMessage(to, { ...parsed.data, locale });
  return sent ? { status: "success" } : { status: "error", message: "server" };
}
