"use server";

import { redirect } from "@/i18n/navigation";
import type { FormState } from "@/lib/actions/form-state";
import { safeNext, sendSignInLink } from "@/lib/auth/session";
import { safeLocale } from "@/lib/i18n-server";
import { clientIp } from "@/lib/security/client-ip";
import { withinRateLimit } from "@/lib/security/rate-limit";
import { verifyTurnstile } from "@/lib/security/turnstile";
import { email as emailSchema } from "@/lib/validation/common";

/**
 * Sends a magic link. The answer is the same whether or not the address is
 * known, so the form cannot be used to find out who uses Soley.
 */
export async function requestSignInLink(
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
  const parsed = emailSchema.safeParse(formData.get("email"));
  if (!parsed.success) return { status: "error", errors: { email: "email" } };
  if (!(await withinRateLimit("signIn", [ip, parsed.data]))) {
    return { status: "error", message: "rateLimited" };
  }
  try {
    await sendSignInLink(parsed.data, locale, safeNext(formData.get("next")));
  } catch (error) {
    console.error("Sign-in link failed", error);
    return { status: "error", message: "server" };
  }
  redirect({ href: "/sign-in/check-email", locale });
  return { status: "idle" };
}
