/** What a form's server action returns when it does not redirect. */
export type FormState =
  | { status: "idle" }
  | { status: "success"; message?: string }
  | {
      status: "error";
      /** Field name → translation key under "validation". */
      errors?: Record<string, string>;
      /** A general problem, a translation key chosen by the form. */
      message?:
        "rateLimited" | "captcha" | "server" | "notAllowed" | "conflict";
    };

export const idle: FormState = { status: "idle" };
