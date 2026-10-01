import type { Metadata } from "next";
import { fontVariables } from "@/lib/fonts";
import "../globals.css";

export const metadata: Metadata = {
  title: "Admin · West Mauritius",
  robots: { index: false, follow: false },
};

// Admin has its own root layout: English only, no site header or footer.
export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return (
    <html lang="en" className={fontVariables}>
      <body className="min-h-screen bg-sand-50">{children}</body>
    </html>
  );
}
