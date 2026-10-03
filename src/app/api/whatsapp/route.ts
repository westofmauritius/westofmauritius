import { currentConsent } from "@/lib/forms/consent";
import { validateWhatsapp } from "@/lib/forms/validation";
import { handleForm } from "@/lib/server/forms";

/**
 * Interest in the west coast WhatsApp group. Stored with the consent wording
 * the person agreed to; Olivier invites people from the admin list.
 */
export async function POST(request: Request) {
  return handleForm(request, {
    kind: "whatsapp",
    limit: 5,
    form: "whatsapp",
    validate: validateWhatsapp,
    save: (store, data, { ipHash }) =>
      store.saveWhatsapp({
        ...data,
        consentVersion: currentConsent.whatsapp,
        ipHash,
      }),
  });
}
