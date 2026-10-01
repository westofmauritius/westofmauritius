import { validateContact } from "@/lib/forms/validation";
import { notifyNewContact } from "@/lib/server/emails";
import { handleForm } from "@/lib/server/forms";

/** Messages from the contact page. */
export async function POST(request: Request) {
  return handleForm(request, {
    kind: "contact",
    limit: 5,
    form: "contact",
    validate: validateContact,
    save: async (store, message, { ipHash }) => {
      await store.saveContact({ ...message, ipHash });
      await notifyNewContact(message);
    },
  });
}
