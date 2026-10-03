import { redirect } from "next/navigation";
import { Wordmark } from "@/components/ui/Wordmark";
import { adminConfigured, isAdmin } from "@/lib/server/admin-auth";

export const dynamic = "force-dynamic";

const messages: Record<string, string> = {
  wrong: "Wrong password. Please try again.",
  locked: "Too many attempts. Please wait 15 minutes and try again.",
  unavailable: "The database is not configured, so admin is unavailable.",
};

export default async function AdminLoginPage({
  searchParams,
}: PageProps<"/admin/login">) {
  if (await isAdmin()) redirect("/admin/leads");
  const { error } = await searchParams;
  const message = typeof error === "string" ? messages[error] : undefined;

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-sm bg-white p-8 shadow-sm ring-1 ring-line">
        <Wordmark name="West of Mauritius" className="text-xl" />
        <h1 className="mt-8 text-3xl">Admin</h1>
        {!adminConfigured() ? (
          <p className="mt-4 text-small leading-relaxed text-ink-muted">
            Admin is switched off. Set <code>ADMIN_PASSWORD</code> and{" "}
            <code>ADMIN_SESSION_SECRET</code> (at least 32 characters) as
            secrets in Cloudflare to switch it on.
          </p>
        ) : (
          <form
            action="/api/admin/login"
            method="post"
            className="mt-6 space-y-4"
          >
            {message && (
              <p
                role="alert"
                className="rounded-sm bg-coral-50 p-3 text-small text-coral-700"
              >
                {message}
              </p>
            )}
            <label className="block text-small font-medium">
              Password
              <input
                type="password"
                name="password"
                required
                autoComplete="current-password"
                autoFocus
                className="mt-2 block min-h-12 w-full rounded-sm border border-line px-4 text-base"
              />
            </label>
            <button
              type="submit"
              className="min-h-12 w-full rounded-full bg-ocean-900 text-small font-medium text-white hover:bg-ocean-700"
            >
              Log in
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
