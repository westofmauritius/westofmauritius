import "server-only";
import { getDb } from "../data";
import type { PlatformSettingsRow } from "../data/schema";

const defaults: PlatformSettingsRow = {
  id: true,
  lead_price_mur: 0,
  default_monthly_cap: 20,
  auto_routing: true,
  updated_by: null,
  updated_at: new Date(0).toISOString(),
};

/** Lead price, default monthly cap and automatic routing switch. */
export async function getPlatformSettings(): Promise<PlatformSettingsRow> {
  const [row] = await getDb().select("platform_settings", { id: true });
  return row ?? defaults;
}
