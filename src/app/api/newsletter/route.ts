import { currentConsent } from "@/lib/forms/consent";
import { validateNewsletter } from "@/lib/forms/validation";
import { sendNewsletterConfirmation } from "@/lib/server/emails";
import { handleForm } from "@/lib/server/forms";
import { randomToken } from "@/lib/server/request";

/** Newsletter sign-up. Sends a confirmation link (double opt-in). */
export async function POST(request: Request) {
  return handleForm(request, {
    kind: "newsletter",
    limit: 5,
    form: "newsletter",
    validate: validateNewsletter,
    save: async (store, { email, locale }, { ipHash }) => {
      const { token, alreadyConfirmed } = await store.saveSubscriber({
        email,
        locale,
        consentVersion: currentConsent.newsletter,
        token: randomToken(),
        ipHash,
      });
      if (!alreadyConfirmed)
        await sendNewsletterConfirmation(email, token, locale);
    },
  });
}
