import { describe, expect, it } from "vitest";
import { conversionsBySource } from "./conversions";

describe("conversionsBySource", () => {
  it("counts each kind per page, busiest page first", () => {
    const rows = conversionsBySource(
      [{ source: "area-tamarin" }, { source: "guide-sunset-spots" }],
      [{ source: "area-tamarin" }, { source: "footer" }, { source: "" }],
      [{ source: "community" }, { source: "area-tamarin" }],
    );
    expect(rows[0]).toEqual({
      source: "area-tamarin",
      leads: 1,
      newsletter: 1,
      whatsapp: 1,
      total: 3,
    });
    expect(rows.map((r) => r.source)).toContain("(unknown)");
    expect(rows).toHaveLength(5);
  });
});
