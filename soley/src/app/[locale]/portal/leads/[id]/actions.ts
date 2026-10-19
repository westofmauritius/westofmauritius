"use server";

import { revalidatePath } from "next/cache";
import type { FormState } from "@/lib/actions/form-state";
import { actionViewer } from "@/lib/auth/roles";
import {
  acceptLead,
  declineLead,
  LeadError,
  saveQuote,
} from "@/lib/services/leads";
import { fieldErrors } from "@/lib/validation/common";
import { declineSchema, quoteSchema } from "@/lib/validation/quote";

/** Every portal action starts here: only the installer's own leads. */
async function installerOrError() {
  const viewer = await actionViewer();
  return viewer?.installer ?? null;
}

function failure(error: unknown): FormState {
  if (error instanceof LeadError) {
    return {
      status: "error",
      message: error.code === "notFound" ? "notAllowed" : "conflict",
    };
  }
  console.error("Portal action failed", error);
  return { status: "error", message: "server" };
}

export async function acceptLeadAction(
  assignmentId: string,
  _previous: FormState,
): Promise<FormState> {
  const installer = await installerOrError();
  if (!installer) return { status: "error", message: "notAllowed" };
  try {
    await acceptLead(assignmentId, installer);
  } catch (error) {
    return failure(error);
  }
  revalidatePath("/[locale]/portal", "layout");
  return { status: "success", message: "accepted" };
}

export async function declineLeadAction(
  assignmentId: string,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const installer = await installerOrError();
  if (!installer) return { status: "error", message: "notAllowed" };
  const parsed = declineSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return { status: "error", errors: fieldErrors(parsed.error) };
  try {
    await declineLead(assignmentId, installer, parsed.data.reason);
  } catch (error) {
    return failure(error);
  }
  revalidatePath("/[locale]/portal", "layout");
  return { status: "success", message: "declined" };
}

export async function saveQuoteAction(
  assignmentId: string,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const installer = await installerOrError();
  if (!installer) return { status: "error", message: "notAllowed" };
  const parsed = quoteSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return { status: "error", errors: fieldErrors(parsed.error) };
  let outcome: "created" | "updated";
  try {
    outcome = await saveQuote(assignmentId, installer, parsed.data);
  } catch (error) {
    return failure(error);
  }
  revalidatePath("/[locale]/portal", "layout");
  return { status: "success", message: outcome };
}
