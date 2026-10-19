"use server";

import { getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import type { FormState } from "@/lib/actions/form-state";
import {
  emailAdminNewRequest,
  emailRequestReceived,
} from "@/lib/email/templates";
import { safeLocale } from "@/lib/i18n-server";
import { clientIp } from "@/lib/security/client-ip";
import { withinRateLimit } from "@/lib/security/rate-limit";
import { verifyTurnstile } from "@/lib/security/turnstile";
import { createQuoteRequest } from "@/lib/services/requests";
import { routeNewRequest } from "@/lib/services/assignments";
import { fieldErrors } from "@/lib/validation/common";
import { quoteRequestSchema } from "@/lib/validation/quote-request";

/**
 * Receives the quote form. Checks, in order: bot protection, rate limit,
 * validation (again, whatever the browser checked). Then saves the request
 * with the consent record, routes it to installers and sends the e-mails.
 */
export async function submitQuoteRequest(
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

  const parsed = quoteRequestSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: "error", errors: fieldErrors(parsed.error) };
  }

  if (!(await withinRateLimit("quoteRequest", [ip, parsed.data.email]))) {
    return { status: "error", message: "rateLimited" };
  }

  let reference: string;
  try {
    const { request, household } = await createQuoteRequest(
      parsed.data,
      locale,
    );
    reference = request.reference;
    await routeNewRequest(request.id);
    const tr = await getTranslations({ locale: "en", namespace: "regions" });
    await Promise.all([
      emailRequestReceived(household.email ?? parsed.data.email, locale, {
        name: parsed.data.name,
        reference,
      }),
      process.env.ADMIN_NOTIFICATION_EMAIL
        ? emailAdminNewRequest(process.env.ADMIN_NOTIFICATION_EMAIL, {
            reference,
            region: tr(request.region),
            requestId: request.id,
          })
        : Promise.resolve(true),
    ]);
  } catch (error) {
    console.error("Quote request failed", error);
    return { status: "error", message: "server" };
  }

  redirect({
    href: { pathname: "/get-quotes/thank-you", query: { ref: reference } },
    locale,
  });
  return { status: "idle" }; // not reached: redirect() throws
}
