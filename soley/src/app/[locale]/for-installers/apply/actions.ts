"use server";

import { redirect } from "@/i18n/navigation";
import type { FormState } from "@/lib/actions/form-state";
import {
  emailAdminNewApplication,
  emailApplicationReceived,
} from "@/lib/email/templates";
import { safeLocale } from "@/lib/i18n-server";
import { clientIp } from "@/lib/security/client-ip";
import { withinRateLimit } from "@/lib/security/rate-limit";
import { verifyTurnstile } from "@/lib/security/turnstile";
import {
  createInstallerApplication,
  DuplicateApplicationError,
} from "@/lib/services/installers";
import { fieldErrors } from "@/lib/validation/common";
import {
  applicationFromForm,
  checkFiles,
  filesFromForm,
  installerApplicationSchema,
} from "@/lib/validation/installer";

export async function submitInstallerApplication(
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

  const parsed = installerApplicationSchema.safeParse(
    applicationFromForm(formData),
  );
  const files = filesFromForm(formData);
  const errors = {
    ...(parsed.success ? {} : fieldErrors(parsed.error)),
    ...checkFiles(files, { requireRegistration: true }),
  };
  if (!parsed.success || Object.keys(errors).length)
    return { status: "error", errors };

  if (
    !(await withinRateLimit("installerApplication", [
      ip,
      parsed.data.contact_email,
    ]))
  ) {
    return { status: "error", message: "rateLimited" };
  }

  try {
    const installer = await createInstallerApplication(
      parsed.data,
      files,
      locale,
    );
    await Promise.all([
      emailApplicationReceived(installer.contact_email, locale, {
        name: installer.contact_name,
        company: installer.company_name,
      }),
      process.env.ADMIN_NOTIFICATION_EMAIL
        ? emailAdminNewApplication(process.env.ADMIN_NOTIFICATION_EMAIL, {
            company: installer.company_name,
            installerId: installer.id,
          })
        : Promise.resolve(true),
    ]);
  } catch (error) {
    if (error instanceof DuplicateApplicationError)
      return { status: "error", message: "conflict" };
    console.error("Installer application failed", error);
    return { status: "error", message: "server" };
  }
  redirect({ href: "/for-installers/thank-you", locale });
  return { status: "idle" };
}
