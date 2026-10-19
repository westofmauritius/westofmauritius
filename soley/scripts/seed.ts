/**
 * Loads the DEMO data (src/lib/demo/seed-data.ts) into a Supabase database,
 * for a staging or preview project. Every row is marked as demo.
 *
 *   SOLEY_ALLOW_DEMO_SEED=true npm run db:seed
 *
 * Never run this against the live database: it would show demo installers
 * and reviews to real visitors. The guard variable makes that a deliberate
 * choice.
 */
import { createSupabaseDb } from "../src/lib/data/supabase";
import type { TableName, Tables } from "../src/lib/data/schema";
import { demoData } from "../src/lib/demo/seed-data";

async function main() {
  if (process.env.SOLEY_ALLOW_DEMO_SEED !== "true") {
    console.error(
      "Refusing to seed: set SOLEY_ALLOW_DEMO_SEED=true to load DEMO data (never on the live database).",
    );
    process.exit(1);
  }
  const db = createSupabaseDb();
  const data = demoData();
  // Order matters because of foreign keys.
  const order: TableName[] = [
    "admins",
    "installers",
    "installer_regions",
    "installer_reviews",
    "households",
    "quote_requests",
    "lead_assignments",
    "quotes",
    "reviews",
    "platform_settings",
  ];
  for (const table of order) {
    const rows = (data as Partial<{ [T in TableName]: Tables[T][] }>)[table];
    if (!rows?.length) continue;
    // A request's chosen quote is set after the quotes exist (foreign key).
    const toInsert =
      table === "quote_requests"
        ? (rows as Tables["quote_requests"][]).map((r) => ({
            ...r,
            chosen_quote_id: null,
          }))
        : rows;
    await db.upsert(table, toInsert as Tables[typeof table][]);
    console.log(`${table}: ${rows.length} demo rows`);
  }
  for (const request of data.quote_requests) {
    if (request.chosen_quote_id) {
      await db.update(
        "quote_requests",
        { id: request.id },
        { chosen_quote_id: request.chosen_quote_id },
      );
    }
  }
  console.log("Demo data loaded. Every row is marked as demo.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
