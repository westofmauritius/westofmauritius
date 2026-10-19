import type { Metadata } from "next";
import { LegalPage, legalMetadata } from "@/components/legal/LegalPage";
import { resolveLocale } from "@/i18n/locale";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/terms">): Promise<Metadata> {
  return legalMetadata("terms", await resolveLocale(params));
}

export default async function TermsPage({
  params,
}: PageProps<"/[locale]/terms">) {
  return <LegalPage pageKey="terms" locale={await resolveLocale(params)} />;
}
