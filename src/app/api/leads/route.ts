import { currentConsent } from "@/lib/forms/consent";
import { validateLead } from "@/lib/forms/validation";
import index from "@/lib/generated/content-index.json";
import { notifyNewLead, sendLeadReceipt } from "@/lib/server/emails";
import { handleForm } from "@/lib/server/forms";

/** Property enquiries from /live-in-the-west/enquire. */
export async function POST(request: Request) {
  return handleForm(request, {
    kind: "lead",
    limit: 5,
    form: "lead",
    validate: (input) => validateLead(input, index.areas),
    save: async (store, lead, { ipHash }) => {
      await store.saveLead({
        ...lead,
        consentVersion: currentConsent.lead,
        ipHash,
      });
      // E-mails are best effort: the lead is already saved and visible in the admin.
      await Promise.all([notifyNewLead(lead), sendLeadReceipt(lead)]);
    },
  });
}
