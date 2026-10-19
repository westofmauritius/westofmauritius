import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Soley";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/**
 * The sharing image for WhatsApp, Facebook and search results: the brand,
 * the promise and the independence line, in the page's language. Drawn at
 * build time; no photo needed.
 */
export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  const tc = await getTranslations({ locale, namespace: "common" });
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#0a2e4a",
        color: "#fffbf3",
        padding: 72,
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 999,
            background: "#fcc436",
            display: "flex",
          }}
        />
        <div style={{ fontSize: 64, fontWeight: 800 }}>Soley</div>
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 72,
          fontWeight: 800,
          lineHeight: 1.1,
          maxWidth: 1000,
        }}
      >
        {t("title")}
      </div>
      <div style={{ display: "flex", fontSize: 30, color: "#ffd35a" }}>
        {tc("independent")}
      </div>
    </div>,
    size,
  );
}
