import { beforeEach, describe, expect, it } from "vitest";
import { setDbForTests, getDb } from "../data";
import { createMemoryDb } from "../data/memory";
import { demoData } from "../demo/seed-data";
import { eraseHousehold, exportHouseholdData } from "./privacy";

const HOUSEHOLD = "00000000-0000-4000-8000-000000000201";
const PAST_CUSTOMER = "00000000-0000-4000-8000-000000000202";

describe("household privacy rights", () => {
  beforeEach(() => setDbForTests(createMemoryDb(demoData())));

  it("exports the household's data with who it was shared with", async () => {
    const data = await exportHouseholdData(HOUSEHOLD);
    expect(data.household?.email).toBe("household@example.com");
    expect(data.requests).toHaveLength(1);
    expect(data.requests[0]!.sharedWith).toHaveLength(3);
    expect(data.requests[0]!.quotes).toHaveLength(3);
  });

  it("does not include other households", async () => {
    const data = await exportHouseholdData(HOUSEHOLD);
    expect(JSON.stringify(data)).not.toContain("past.customer@example.com");
  });

  it("erases personal data, cancels open requests and removes reviews", async () => {
    await eraseHousehold(HOUSEHOLD);
    await eraseHousehold(PAST_CUSTOMER);
    const db = getDb();
    const [household] = await db.select("households", { id: HOUSEHOLD });
    expect(household).toMatchObject({
      email: null,
      name: null,
      phone: null,
      whatsapp: null,
    });
    expect(household!.erased_at).not.toBeNull();
    const [request] = await db.select("quote_requests", {
      household_id: HOUSEHOLD,
    });
    expect(request!.status).toBe("cancelled");
    expect(await db.select("reviews", { household_id: PAST_CUSTOMER })).toEqual(
      [],
    );
    // The installed request of the past customer keeps its status (billing history).
    const [past] = await db.select("quote_requests", {
      household_id: PAST_CUSTOMER,
    });
    expect(past!.status).toBe("installed");
  });
});
