import { describe, expect, it } from "vitest";
import {
  ratingScore,
  responseScore,
  selectInstallers,
  type RoutingCandidate,
} from "./routing";

const base: RoutingCandidate = {
  id: "a",
  status: "approved",
  active: true,
  regions: ["moka", "port-louis"],
  monthlyCap: null,
  leadsThisMonth: 0,
  avgResponseHours: null,
  rating: null,
  reviewCount: 0,
  lastOfferedAt: null,
};
const make = (id: string, overrides: Partial<RoutingCandidate> = {}) => ({
  ...base,
  id,
  ...overrides,
});
const ids = (result: ReturnType<typeof selectInstallers>) =>
  result.selected.map((c) => c.id);

describe("scores", () => {
  it("gives new installers a neutral score", () => {
    expect(responseScore(null)).toBe(0.5);
    expect(ratingScore(null, 0)).toBe(0.5);
  });

  it("rewards fast answers", () => {
    expect(responseScore(0)).toBe(1);
    expect(responseScore(24)).toBe(0.5);
    expect(responseScore(100)).toBe(0);
  });

  it("weighs ratings by the number of reviews", () => {
    expect(ratingScore(5, 5)).toBe(1);
    expect(ratingScore(1, 5)).toBe(0);
    // One perfect review moves the score only a fifth of the way.
    expect(ratingScore(5, 1)).toBeCloseTo(0.6);
  });
});

describe("selectInstallers", () => {
  it("picks at most three", () => {
    const result = selectInstallers(
      { region: "moka" },
      ["a", "b", "c", "d", "e"].map((id) => make(id)),
      20,
    );
    expect(result.selected).toHaveLength(3);
  });

  it("only picks approved, active installers in the region", () => {
    const result = selectInstallers(
      { region: "moka" },
      [
        make("ok"),
        make("applied", { status: "applied" }),
        make("paused", { active: false }),
        make("elsewhere", { regions: ["rodrigues"] }),
      ],
      20,
    );
    expect(ids(result)).toEqual(["ok"]);
    expect(result.skipped).toEqual([
      { id: "applied", reason: "notApproved" },
      { id: "paused", reason: "inactive" },
      { id: "elsewhere", reason: "wrongRegion" },
    ]);
  });

  it("skips installers at their monthly cap, personal or default", () => {
    const result = selectInstallers(
      { region: "moka" },
      [
        make("full-default", { leadsThisMonth: 20 }),
        make("full-own", { leadsThisMonth: 5, monthlyCap: 5 }),
        make("room", { leadsThisMonth: 19 }),
        make("raised", { leadsThisMonth: 25, monthlyCap: 30 }),
      ],
      20,
    );
    expect(ids(result).sort()).toEqual(["raised", "room"]);
    expect(result.skipped.map((s) => s.reason)).toEqual([
      "capReached",
      "capReached",
    ]);
  });

  it("prefers fast, well-rated installers", () => {
    const result = selectInstallers(
      { region: "moka", max: 2 },
      [
        make("slow-poor", { avgResponseHours: 40, rating: 2, reviewCount: 10 }),
        make("fast-good", {
          avgResponseHours: 2,
          rating: 4.8,
          reviewCount: 10,
        }),
        make("new"),
      ],
      20,
    );
    expect(ids(result)).toEqual(["fast-good", "new"]);
  });

  it("rotates fairly between similar installers", () => {
    const result = selectInstallers(
      { region: "moka", max: 2 },
      [
        make("recent", { lastOfferedAt: "2026-10-18T10:00:00Z" }),
        make("waiting", { lastOfferedAt: "2026-10-01T10:00:00Z" }),
        make("never"),
      ],
      20,
    );
    expect(ids(result)).toEqual(["never", "waiting"]);
  });

  it("leaves out installers that were excluded", () => {
    const result = selectInstallers(
      { region: "moka", excludeIds: ["a"] },
      [make("a"), make("b")],
      20,
    );
    expect(ids(result)).toEqual(["b"]);
  });

  it("returns nobody when no one covers the region", () => {
    const result = selectInstallers(
      { region: "rodrigues" },
      [make("a"), make("b")],
      20,
    );
    expect(result.selected).toEqual([]);
  });

  it("is deterministic for equal candidates", () => {
    const candidates = [make("c"), make("a"), make("b")];
    expect(ids(selectInstallers({ region: "moka" }, candidates, 20))).toEqual([
      "a",
      "b",
      "c",
    ]);
  });
});
