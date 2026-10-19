import "server-only";
import type { Locale } from "@/i18n/routing";
import { consentVersions } from "../consent";
import { getDb } from "../data";
import type { HouseholdRow, QuoteRequestRow } from "../data/schema";
import { newId, requestReference } from "../ids";
import type { QuoteRequestInput } from "../validation/quote-request";

/**
 * Saves a quote request: finds or creates the household by e-mail, stores
 * the request and logs the consent (text version, language, time).
 */
export async function createQuoteRequest(
  input: QuoteRequestInput,
  locale: Locale,
): Promise<{ request: QuoteRequestRow; household: HouseholdRow }> {
  const db = getDb();
  const now = new Date().toISOString();

  const [existing] = await db.select("households", { email: input.email });
  const contact = {
    name: input.name,
    phone: input.phone,
    whatsapp:
      input.whatsapp ??
      (input.preferred_contact === "whatsapp" ? input.phone : null),
    preferred_contact: input.preferred_contact,
    locale,
  };
  let household: HouseholdRow;
  if (existing) {
    [household] = (await db.update(
      "households",
      { id: existing.id },
      contact,
    )) as [HouseholdRow];
  } else {
    [household] = (await db.insert("households", {
      id: newId(),
      email: input.email,
      ...contact,
      is_demo: false,
      erased_at: null,
      created_at: now,
      updated_at: now,
    })) as [HouseholdRow];
  }

  const [request] = (await db.insert("quote_requests", {
    id: newId(),
    reference: requestReference(),
    household_id: household.id,
    status: "new",
    region: input.region,
    town: input.town ?? null,
    property_type: input.property_type,
    ownership: input.ownership,
    roof_type: input.roof_type,
    roof_area_m2: input.roof_area_m2 ?? null,
    shading: input.shading,
    monthly_bill_mur: Math.round(input.monthly_bill_mur),
    desired_kwp: input.desired_kwp ?? null,
    battery_interest: input.battery_interest,
    timeline: input.timeline,
    financing: input.financing,
    grant_interest: input.grant_interest,
    notes: input.notes ?? null,
    max_installers: 3,
    chosen_quote_id: null,
    chosen_at: null,
    installed_at: null,
    quote_reminder_sent_at: null,
    is_demo: false,
    created_at: now,
    updated_at: now,
  })) as [QuoteRequestRow];

  await db.insert("consents", {
    id: newId(),
    household_id: household.id,
    quote_request_id: request.id,
    installer_id: null,
    purpose: "shareWithInstallers",
    text_version: consentVersions.shareWithInstallers,
    locale,
    granted: true,
    created_at: now,
  });

  return { request, household };
}
