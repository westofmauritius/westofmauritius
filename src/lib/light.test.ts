import { describe, expect, it } from "vitest";
import { LIGHT_PLACE, lightPhase, lightScript } from "./light";
import { nextSunset } from "./sun";

const { lat, lng } = LIGHT_PLACE;
/** A moment in Mauritius local time (UTC+4). */
const at = (iso: string) => Date.parse(`${iso}+04:00`);

describe("lightPhase", () => {
  it("walks through the day in order on a winter and a summer day", () => {
    for (const day of ["2026-06-21", "2026-12-21"]) {
      const phases: string[] = [];
      for (let h = 0; h < 24; h += 0.25) {
        const hh = String(Math.floor(h)).padStart(2, "0");
        const mm = String((h % 1) * 60).padStart(2, "0");
        const p = lightPhase(lat, lng, at(`${day}T${hh}:${mm}:00`));
        if (phases.at(-1) !== p) phases.push(p);
      }
      expect(phases).toEqual([
        "night",
        "morning",
        "day",
        "golden",
        "dusk",
        "night",
      ]);
    }
  });

  it("is golden just before sunset and dusk just after, matching sun.ts", () => {
    const noon = new Date(at("2026-10-05T12:00:00"));
    const sunset = nextSunset(lat, lng, noon)!.sunset.getTime();
    expect(lightPhase(lat, lng, sunset - 5 * 60000)).toBe("golden");
    expect(lightPhase(lat, lng, sunset + 5 * 60000)).toBe("dusk");
  });

  it("is day at noon and night at midnight", () => {
    expect(lightPhase(lat, lng, at("2026-10-05T12:00:00"))).toBe("day");
    expect(lightPhase(lat, lng, at("2026-10-05T23:30:00"))).toBe("night");
    expect(lightPhase(lat, lng, at("2026-10-05T06:30:00"))).toBe("morning");
  });

  it("works as an inline script on its own", () => {
    const html = { dataset: {} as Record<string, string> };
    new Function("document", lightScript())({ documentElement: html });
    expect(["morning", "day", "golden", "dusk", "night"]).toContain(
      html.dataset.light,
    );
  });
});
