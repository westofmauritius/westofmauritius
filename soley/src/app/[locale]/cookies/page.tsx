import type { Metadata } from "next";
import { LegalPage, legalMetadata } from "@/components/legal/LegalPage";
import { resolveLocale } from "@/i18n/locale";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/cookies">): Promise<Metadata> {
  return legalMetadata("cookies", await resolveLocale(params));
}

export default async function CookiesPage({
  params,
}: PageProps<"/[locale]/cookies">) {
  return <LegalPage pageKey="cookies" locale={await resolveLocale(params)} />;
}
