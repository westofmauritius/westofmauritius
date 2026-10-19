import { describe, expect, it } from "vitest";
import { dashboardMetrics, requestsPerWeek, weekStart } from "./metrics";

describe("dashboard metrics", () => {
  it("finds the Monday of a week", () => {
    expect(weekStart(new Date("2026-10-19T10:00:00Z"))).toBe("2026-10-19"); // a Monday
    expect(weekStart(new Date("2026-10-25T23:00:00Z"))).toBe("2026-10-19"); // Sunday
  });

  it("counts requests per week, including empty weeks", () => {
    const now = new Date("2026-10-21T12:00:00Z");
    const weeks = requestsPerWeek(
      [
        { created_at: "2026-10-20T08:00:00Z", status: "new" },
        { created_at: "2026-10-19T08:00:00Z", status: "new" },
        { created_at: "2026-10-08T08:00:00Z", status: "new" },
        { created_at: "2025-01-01T08:00:00Z", status: "new" }, // too old
      ],
      now,
      3,
    );
    expect(weeks).toEqual([
      { week: "2026-10-05", count: 1 },
      { week: "2026-10-12", count: 0 },
      { week: "2026-10-19", count: 2 },
    ]);
  });

  it("averages response time, win rate and fees", () => {
    const m = dashboardMetrics(
      [
        { created_at: "", status: "quoted" },
        { created_at: "", status: "chosen" },
        { created_at: "", status: "new" },
        { created_at: "", status: "installed" },
      ],
      [
        {
          offered_at: "2026-10-01T00:00:00Z",
          responded_at: "2026-10-01T02:00:00Z",
          status: "accepted",
          fee_mur: 500,
        },
        {
          offered_at: "2026-10-01T00:00:00Z",
          responded_at: "2026-10-01T06:00:00Z",
          status: "declined",
          fee_mur: null,
        },
        {
          offered_at: "2026-10-01T00:00:00Z",
          responded_at: null,
          status: "offered",
          fee_mur: null,
        },
      ],
    );
    expect(m.avgResponseHours).toBe(4);
    expect(m.winRate).toBeCloseTo(2 / 3);
    expect(m.billedMur).toBe(500);
    expect(m.revenuePerRequest).toBe(125);
  });

  it("handles no data", () => {
    const m = dashboardMetrics([], []);
    expect(m.avgResponseHours).toBeNull();
    expect(m.winRate).toBeNull();
    expect(m.revenuePerRequest).toBeNull();
  });
});
