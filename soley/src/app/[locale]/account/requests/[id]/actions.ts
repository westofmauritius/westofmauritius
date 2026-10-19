"use server";

import { revalidatePath } from "next/cache";
import type { FormState } from "@/lib/actions/form-state";
import { actionViewer } from "@/lib/auth/roles";
import { clientIp } from "@/lib/security/client-ip";
import { withinRateLimit } from "@/lib/security/rate-limit";
import {
  chooseQuote,
  closeRequest,
  confirmInstalled,
  HouseholdError,
  submitReview,
} from "@/lib/services/household";
import { fieldErrors } from "@/lib/validation/common";
import { reviewSchema } from "@/lib/validation/review";

/** The signed-in household; every action works only on its own requests. */
async function householdId() {
  return (await actionViewer())?.household?.id ?? null;
}

function failed(error: unknown): FormState {
  if (error instanceof HouseholdError)
    return { status: "error", message: "conflict" };
  console.error("Account action failed", error);
  return { status: "error", message: "server" };
}

const refresh = () => {
  revalidatePath("/[locale]/account", "layout");
  revalidatePath("/[locale]/admin", "layout");
  revalidatePath("/[locale]/portal", "layout");
};

export async function chooseQuoteAction(
  requestId: string,
  quoteId: string,
  _previous: FormState,
): Promise<FormState> {
  const id = await householdId();
  if (!id) return { status: "error", message: "notAllowed" };
  try {
    await chooseQuote(requestId, quoteId, id);
  } catch (error) {
    return failed(error);
  }
  refresh();
  return { status: "success" };
}

export async function closeRequestAction(
  requestId: string,
  _previous: FormState,
): Promise<FormState> {
  const id = await householdId();
  if (!id) return { status: "error", message: "notAllowed" };
  try {
    await closeRequest(requestId, id);
  } catch (error) {
    return failed(error);
  }
  refresh();
  return { status: "success" };
}

export async function confirmInstalledAction(
  requestId: string,
  _previous: FormState,
): Promise<FormState> {
  const id = await householdId();
  if (!id) return { status: "error", message: "notAllowed" };
  try {
    await confirmInstalled(requestId, id);
  } catch (error) {
    return failed(error);
  }
  refresh();
  return { status: "success" };
}

export async function submitReviewAction(
  requestId: string,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const id = await householdId();
  if (!id) return { status: "error", message: "notAllowed" };
  const parsed = reviewSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return { status: "error", errors: fieldErrors(parsed.error) };
  if (!(await withinRateLimit("review", [await clientIp(), id]))) {
    return { status: "error", message: "rateLimited" };
  }
  try {
    await submitReview(requestId, id, parsed.data);
  } catch (error) {
    return failed(error);
  }
  refresh();
  return { status: "success" };
}
