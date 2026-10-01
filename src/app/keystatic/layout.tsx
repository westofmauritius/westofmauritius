import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { keystaticEnabled } from "@/lib/keystatic";
import KeystaticApp from "./keystatic";

export const metadata: Metadata = {
  title: "Content editor · West Mauritius",
  robots: { index: false, follow: false },
};

// A separate root layout: the editor has its own UI and does not use the
// site's header, footer, fonts or language routing.
export default function KeystaticLayout() {
  if (!keystaticEnabled) notFound();
  return (
    <html lang="en">
      <body>
        <KeystaticApp />
      </body>
    </html>
  );
}
