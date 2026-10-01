import { describe, expect, it } from "vitest";
import { closedDays, formatDays } from "./opening-hours";

describe("formatDays", () => {
  it("joins three or more consecutive days into a range", () => {
    expect(formatDays(["tu", "we", "th", "fr", "sa"], "en")).toBe("Tue–Sat");
  });

  it("lists one or two days separately", () => {
    expect(formatDays(["mo", "we"], "en")).toBe("Mon, Wed");
    expect(formatDays(["sa", "su"], "en")).toBe("Sat, Sun");
  });

  it("sorts days into week order", () => {
    expect(formatDays(["su", "mo", "tu", "we"], "en")).toBe("Mon–Wed, Sun");
  });

  it("uses the visitor's language", () => {
    expect(formatDays(["mo", "tu", "we"], "fr")).toBe("lun.–mer.");
  });
});

describe("closedDays", () => {
  it("returns the days not covered by any row", () => {
    expect(
      closedDays([
        {
          days: ["tu", "we", "th", "fr", "sa"],
          opens: "12:00",
          closes: "22:00",
        },
        { days: ["su"], opens: "12:00", closes: "16:00" },
      ]),
    ).toEqual(["mo"]);
  });
});
