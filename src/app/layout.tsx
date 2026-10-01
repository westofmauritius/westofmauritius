import type { Metadata } from "next";
import { fontVariables } from "@/lib/fonts";
import "./globals.css";

// Temporary root layout. Step 3 moves <html lang> and the header/footer into
// the language-aware layout at `src/app/[locale]/layout.tsx`.
export const metadata: Metadata = {
  title: "West Mauritius",
  description:
    "Restaurants, beaches, sunsets and living on the west coast of Mauritius.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fontVariables} h-full`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
