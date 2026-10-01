import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

/**
 * Gives the form components (client side) their texts. Only the "Forms"
 * texts are sent to the browser, not the whole site's translations.
 */
export async function FormsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const messages = await getMessages();
  return (
    <NextIntlClientProvider messages={{ Forms: messages.Forms }}>
      {children}
    </NextIntlClientProvider>
  );
}
