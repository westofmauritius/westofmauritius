import { getLocale, getTranslations } from "next-intl/server";

/** Sign-out is a POST (see /auth/sign-out), so it is a small form. */
export async function SignOutForm() {
  const t = await getTranslations("common");
  const locale = await getLocale();
  return (
    <form action="/auth/sign-out" method="post">
      <input type="hidden" name="locale" value={locale} />
      <button
        type="submit"
        className="inline-flex min-h-11 items-center font-semibold text-ocean-600 underline underline-offset-4"
      >
        {t("signOut")}
      </button>
    </form>
  );
}
