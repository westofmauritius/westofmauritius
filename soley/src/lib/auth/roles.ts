import "server-only";
import { forbidden } from "next/navigation";
import { redirect } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getPathname } from "@/i18n/navigation";
import { getDb } from "../data";
import type { HouseholdRow, InstallerRow } from "../data/schema";
import { currentEmail, isAdmin } from "./session";

export type Viewer = {
  email: string;
  admin: boolean;
  /** The installer company this e-mail belongs to (any status). */
  installer: InstallerRow | null;
  household: HouseholdRow | null;
};

/** Who is signed in, and in which roles. Null when nobody is. */
export async function getViewer(): Promise<Viewer | null> {
  const email = await currentEmail();
  if (!email) return null;
  const db = getDb();
  const [admin, installers, households] = await Promise.all([
    isAdmin(email),
    db.select("installers", { contact_email: email }),
    db.select("households", { email }),
  ]);
  return {
    email,
    admin,
    installer: installers[0] ?? null,
    household: households[0] ?? null,
  };
}

type Href = Parameters<typeof getPathname>[0]["href"];

/** Sends visitors who are not signed in to the sign-in page, then back. */
export async function requireViewer(
  locale: Locale,
  back: Href,
): Promise<Viewer> {
  const viewer = await getViewer();
  if (!viewer) {
    redirect({
      href: {
        pathname: "/sign-in",
        query: { next: getPathname({ href: back, locale }) },
      },
      locale,
    });
  }
  return viewer!;
}

export async function requireAdmin(locale: Locale, back: Href = "/admin") {
  const viewer = await requireViewer(locale, back);
  if (!viewer.admin) forbidden();
  return viewer;
}

/** An approved (or suspended, read-only) installer. */
export async function requireInstaller(locale: Locale, back: Href = "/portal") {
  const viewer = await requireViewer(locale, back);
  if (!viewer.installer) forbidden();
  return viewer as Viewer & { installer: InstallerRow };
}

export async function requireHousehold(
  locale: Locale,
  back: Href = "/account",
) {
  const viewer = await requireViewer(locale, back);
  return viewer;
}

/** For server actions: the viewer or an error, never a redirect. */
export async function actionViewer(): Promise<Viewer | null> {
  return getViewer();
}
