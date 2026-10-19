import "server-only";
import { getDb, usesSupabase } from "../data";
import { createServiceClient } from "../data/supabase";

/**
 * The household's rights under the GDPR and the Mauritius Data Protection
 * Act 2017: a copy of their data (export) and erasure.
 */

/** Everything Soley holds about a household, as plain JSON. */
export async function exportHouseholdData(householdId: string) {
  const db = getDb();
  const [[household], requests, consents, reviews] = await Promise.all([
    db.select("households", { id: householdId }),
    db.select("quote_requests", { household_id: householdId }),
    db.select("consents", { household_id: householdId }),
    db.select("reviews", { household_id: householdId }),
  ]);
  const requestIds = requests.map((r) => r.id);
  const [assignments, quotes, installers] = await Promise.all([
    requestIds.length
      ? db.select("lead_assignments", { quote_request_id: requestIds })
      : Promise.resolve([]),
    requestIds.length
      ? db.select("quotes", { quote_request_id: requestIds })
      : Promise.resolve([]),
    db.select("installers"),
  ]);
  const company = (id: string) =>
    installers.find((i) => i.id === id)?.company_name ?? null;
  return {
    exportedAt: new Date().toISOString(),
    controller: "Soley",
    household: household ?? null,
    requests: requests.map((request) => ({
      ...request,
      // Who received the request: the people the data was shared with.
      sharedWith: assignments
        .filter((a) => a.quote_request_id === request.id)
        .map((a) => ({
          installer: company(a.installer_id),
          status: a.status,
          offeredAt: a.offered_at,
        })),
      quotes: quotes
        .filter((q) => q.quote_request_id === request.id)
        .map((q) => ({ ...q, installer: company(q.installer_id) })),
    })),
    consents,
    reviews,
  };
}

/**
 * Erases a household's personal data. The request rows stay without
 * anything that identifies the person (invoices sent to installers refer
 * to them; see PLAN.md Assumption 13). Open requests are cancelled and
 * withdrawn from installers, and the household's reviews are deleted.
 * The consent log keeps only what was agreed and when, linked to an
 * anonymous id, as proof that sharing had been agreed.
 */
export async function eraseHousehold(householdId: string) {
  const db = getDb();
  const [household] = await db.select("households", { id: householdId });
  if (!household) return;
  const email = household.email;
  const requests = await db.select("quote_requests", {
    household_id: householdId,
  });
  for (const request of requests) {
    const open = !["installed", "cancelled", "chosen"].includes(request.status);
    await db.update(
      "quote_requests",
      { id: request.id },
      {
        town: null,
        notes: null,
        ...(open ? { status: "cancelled" as const } : {}),
      },
    );
    const assignments = await db.select("lead_assignments", {
      quote_request_id: request.id,
    });
    for (const a of assignments) {
      if (a.status === "offered")
        await db.update(
          "lead_assignments",
          { id: a.id },
          { status: "withdrawn" },
        );
    }
  }
  await db.remove("reviews", { household_id: householdId });
  await db.update(
    "households",
    { id: householdId },
    {
      email: null,
      name: null,
      phone: null,
      whatsapp: null,
      preferred_contact: null,
      erased_at: new Date().toISOString(),
    },
  );
  if (email && usesSupabase()) await deleteAuthUser(email);
}

/** Removes the sign-in account from Supabase Auth as well. */
async function deleteAuthUser(email: string) {
  const client = createServiceClient();
  for (let page = 1; page < 50; page += 1) {
    const { data, error } = await client.auth.admin.listUsers({
      page,
      perPage: 200,
    });
    if (error || !data.users.length) return;
    const user = data.users.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase(),
    );
    if (user) {
      await client.auth.admin.deleteUser(user.id);
      return;
    }
  }
}
