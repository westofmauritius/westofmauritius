import type { Metadata } from "next";
import "./globals.css";

// Temporary root layout. Fonts, colours and the language-aware layout
// (`src/app/[locale]/layout.tsx`) are added in steps 2 and 3.
export const metadata: Metadata = {
  title: "West Mauritius",
  description:
    "Restaurants, beaches, sunsets and living on the west coast of Mauritius.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
