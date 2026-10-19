import "server-only";
import { getDb } from "../data";
import type { InstallerRow, ReviewRow } from "../data/schema";
import type { Region } from "../regions";

export type DirectoryEntry = {
  installer: InstallerRow;
  regions: Region[];
  rating: number | null;
  reviewCount: number;
  reviews: ReviewRow[];
};

/**
 * Approved installers only, with their published reviews. Paused
 * installers stay listed (they are vetted); suspended or rejected ones
 * never appear.
 */
export async function listDirectory(): Promise<DirectoryEntry[]> {
  const db = getDb();
  const [installers, regions, reviews] = await Promise.all([
    db.select(
      "installers",
      { status: "approved" },
      { orderBy: "company_name" },
    ),
    db.select("installer_regions"),
    db.select(
      "reviews",
      { status: "approved" },
      { orderBy: "created_at", ascending: false },
    ),
  ]);
  return installers.map((installer) => {
    const own = reviews.filter((r) => r.installer_id === installer.id);
    return {
      installer,
      regions: regions
        .filter((r) => r.installer_id === installer.id)
        .map((r) => r.region),
      rating: own.length
        ? own.reduce((sum, r) => sum + r.rating, 0) / own.length
        : null,
      reviewCount: own.length,
      reviews: own,
    };
  });
}

export async function getDirectoryEntry(
  slug: string,
): Promise<DirectoryEntry | null> {
  return (await listDirectory()).find((e) => e.installer.slug === slug) ?? null;
}

/** Directory pages are built ahead; without a database there are none. */
export async function directorySlugs(): Promise<string[]> {
  try {
    return (await listDirectory()).map((e) => e.installer.slug);
  } catch {
    return [];
  }
}
