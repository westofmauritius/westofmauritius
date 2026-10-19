"use server";

import { getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import type { FormState } from "@/lib/actions/form-state";
import { actionViewer } from "@/lib/auth/roles";
import { signOut } from "@/lib/auth/session";
import { safeLocale } from "@/lib/i18n-server";
import { eraseHousehold } from "@/lib/services/privacy";

/** Erases the household's data after the confirmation word is typed. */
export async function deleteMyDataAction(
  localeArg: string,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const locale = safeLocale(localeArg);
  const viewer = await actionViewer();
  if (!viewer?.household) return { status: "error", message: "notAllowed" };
  const t = await getTranslations({ locale, namespace: "account.privacy" });
  if (
    String(formData.get("confirm") ?? "")
      .trim()
      .toUpperCase() !== t("deleteWord")
  ) {
    return { status: "error", errors: { confirm: "invalid" } };
  }
  await eraseHousehold(viewer.household.id);
  await signOut();
  redirect({ href: { pathname: "/sign-in", query: { deleted: "1" } }, locale });
  return { status: "idle" };
}
