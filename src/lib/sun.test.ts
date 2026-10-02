import { describe, expect, it } from "vitest";
import { nextSunset, sunsetUtc } from "./sun";

// Tamarin, on the west coast.
const lat = -20.33;
const lng = 57.37;

/** Local Mauritius time (UTC+4) as minutes after midnight. */
const local = (date: Date) =>
  ((date.getUTCHours() + 4) % 24) * 60 + date.getUTCMinutes();

describe("sunsetUtc", () => {
  it("sets around 17:40 in June and around 18:55 in December", () => {
    // Mauritius sunsets run from about 17:35 in winter to about 19:00 in
    // summer; the exact values below come from the formula itself.
    const june = local(sunsetUtc(2026, 6, 21, lat, lng)!);
    const december = local(sunsetUtc(2026, 12, 21, lat, lng)!);
    expect(june).toBeGreaterThan(17 * 60 + 30);
    expect(june).toBeLessThan(17 * 60 + 50);
    expect(december).toBeGreaterThan(18 * 60 + 45);
    expect(december).toBeLessThan(19 * 60 + 5);
  });

  it("starts the golden light about half an hour before sunset", () => {
    const sunset = sunsetUtc(2026, 10, 2, lat, lng)!;
    const golden = sunsetUtc(2026, 10, 2, lat, lng, 84)!;
    const minutes = (sunset.getTime() - golden.getTime()) / 60_000;
    expect(minutes).toBeGreaterThan(20);
    expect(minutes).toBeLessThan(40);
  });
});

describe("nextSunset", () => {
  it("gives tonight's sunset in the afternoon and tomorrow's after dark", () => {
    const afternoon = new Date(Date.UTC(2026, 9, 2, 10)); // 14:00 in Mauritius
    const night = new Date(Date.UTC(2026, 9, 2, 17)); // 21:00 in Mauritius
    expect(nextSunset(lat, lng, afternoon)?.tomorrow).toBe(false);
    const after = nextSunset(lat, lng, night)!;
    expect(after.tomorrow).toBe(true);
    expect(after.sunset.getUTCDate()).toBe(3);
  });
});
