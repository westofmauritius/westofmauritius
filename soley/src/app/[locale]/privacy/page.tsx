import type { Metadata } from "next";
import { LegalPage, legalMetadata } from "@/components/legal/LegalPage";
import { resolveLocale } from "@/i18n/locale";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/privacy">): Promise<Metadata> {
  return legalMetadata("privacy", await resolveLocale(params));
}

export default async function PrivacyPage({
  params,
}: PageProps<"/[locale]/privacy">) {
  return <LegalPage pageKey="privacy" locale={await resolveLocale(params)} />;
}
