import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Learn accounting by doing it | Oliver Smith",
    template: "%s | Oliver Smith, Accounting and finance",
  },
  description:
    "Practice accounting as a junior accountant in a fictional company. Handle real looking documents and see what happens in the books after every step.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <header className="border-b border-line bg-white">
          <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between px-4">
            <Link href="/" className="flex items-center gap-2.5">
              <span
                aria-hidden
                className="grid size-7 place-items-center rounded bg-brand text-xs font-bold text-white"
              >
                OS
              </span>
              <span className="text-sm leading-tight">
                <span className="font-semibold text-ink">Oliver Smith</span>
                <span className="text-muted">, Accounting and finance</span>
              </span>
            </Link>
            <span className="hidden text-xs text-muted sm:block">Practice in a fictional company</span>
          </div>
        </header>
        <div className="flex flex-1 flex-col">{children}</div>
      </body>
    </html>
  );
}
