import Link from "next/link";
import { redirect } from "next/navigation";
import { Wordmark } from "@/components/ui/Wordmark";
import { isAdmin } from "@/lib/server/admin-auth";

// Every admin page is rendered per request (never cached) and checks the session.
export const dynamic = "force-dynamic";

const tabs = [
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/contacts", label: "Contact messages" },
  { href: "/admin/newsletter", label: "Newsletter" },
];

export default async function ProtectedAdminLayout({
  children,
}: LayoutProps<"/admin">) {
  if (!(await isAdmin())) redirect("/admin/login");
  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Wordmark name="West of Mauritius" className="text-lg" />
            <nav aria-label="Admin">
              <ul className="flex flex-wrap gap-4 text-sm">
                {tabs.map((tab) => (
                  <li key={tab.href}>
                    <Link
                      href={tab.href}
                      className="text-ink-muted hover:text-ink"
                    >
                      {tab.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <form action="/api/admin/logout" method="post">
            <button
              type="submit"
              className="text-sm text-ink-muted underline hover:text-ink"
            >
              Log out
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
