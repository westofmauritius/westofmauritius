import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card } from "@/components/ui";
import { Link } from "@/i18n/navigation";
import { resolveLocale } from "@/i18n/locale";
import { requireInstaller } from "@/lib/auth/roles";
import { getDb } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { getPlatformSettings } from "@/lib/services/settings";
import { ProfileForm, UploadForm } from "./ProfileForms";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("portal.profile");
  return { title: t("title"), robots: { index: false } };
}

export default async function ProfilePage({
  params,
}: PageProps<"/[locale]/portal/profile">) {
  const locale = await resolveLocale(params);
  const { installer } = await requireInstaller(locale, "/portal/profile");
  const t = await getTranslations("portal.profile");
  const ta = await getTranslations("forInstallers.apply.fields");
  const db = getDb();
  const [regionRows, documents, settings] = await Promise.all([
    db.select("installer_regions", { installer_id: installer.id }),
    db.select("installer_documents", { installer_id: installer.id }),
    getPlatformSettings(),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl">{t("title")}</h1>
      <Card>
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-xl">{installer.company_name}</h2>
          <StatusBadge kind="installer" status={installer.status} />
        </div>
        <p className="mt-2 text-ink-muted">{installer.contact_email}</p>
        {installer.status === "approved" && (
          <Link
            href={{
              pathname: "/installers/[slug]",
              params: { slug: installer.slug },
            }}
            className="mt-2 inline-flex min-h-11 items-center font-semibold text-ocean-600 underline underline-offset-4"
          >
            {t("publicLink")}
          </Link>
        )}
      </Card>
      <Card>
        <h2 className="text-xl">{t("leadsTitle")}</h2>
        <div className="mt-4">
          <ProfileForm
            active={installer.active}
            cap={installer.monthly_lead_cap}
            defaultCap={settings.default_monthly_cap}
            coveredRegions={regionRows.map((r) => r.region)}
            locale={installer.locale}
          />
        </div>
      </Card>
      <Card>
        <h2 className="text-xl">{t("documentsTitle")}</h2>
        <p className="mt-1 text-ink-muted">{t("documentsIntro")}</p>
        {documents.length === 0 ? (
          <p className="mt-4">{t("noDocuments")}</p>
        ) : (
          <ul className="mt-4 divide-y divide-line">
            {documents.map((doc) => (
              <li key={doc.id} className="py-2">
                <span className="font-semibold">
                  {ta(`doc_${doc.kind}` as "doc_registration")}
                </span>
                : {doc.file_name}{" "}
                <span className="text-sm text-ink-muted">
                  ({formatDate(doc.created_at, locale)})
                </span>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-6 border-t border-line pt-6">
          <UploadForm />
        </div>
      </Card>
    </div>
  );
}
