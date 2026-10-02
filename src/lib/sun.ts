/**
 * When the sun sets (and when the golden light starts) at a place on a given
 * day. Uses the sunrise equation from the Almanac for Computers (US Naval
 * Observatory), accurate to a minute or two, which is plenty for "come at
 * 18:20". Pure and tiny, so it runs in the visitor's browser: a prerendered
 * page cannot know today's date.
 */

const rad = Math.PI / 180;
const deg = 180 / Math.PI;
const mod = (n: number, m: number) => ((n % m) + m) % m;

/** Official sunset: the sun's upper edge touches the horizon. */
export const SUNSET = 90.833;
/** Golden light: the sun is 6 degrees above the horizon. */
export const GOLDEN = 84;

/**
 * The moment the sun goes down through `zenith` on the given UTC calendar
 * day, or null if it never does (polar day or night, never in Mauritius).
 */
export function sunsetUtc(
  year: number,
  month: number,
  day: number,
  lat: number,
  lng: number,
  zenith = SUNSET,
): Date | null {
  const start = Date.UTC(year, 0, 0);
  const n = Math.round((Date.UTC(year, month - 1, day) - start) / 86_400_000);
  const lngHour = lng / 15;
  const t = n + (18 - lngHour) / 24;

  const meanAnomaly = 0.9856 * t - 3.289;
  const trueLng = mod(
    meanAnomaly +
      1.916 * Math.sin(meanAnomaly * rad) +
      0.02 * Math.sin(2 * meanAnomaly * rad) +
      282.634,
    360,
  );
  let ra = mod(Math.atan(0.91764 * Math.tan(trueLng * rad)) * deg, 360);
  ra += Math.floor(trueLng / 90) * 90 - Math.floor(ra / 90) * 90;
  ra /= 15;

  const sinDec = 0.39782 * Math.sin(trueLng * rad);
  const cosDec = Math.cos(Math.asin(sinDec));
  const cosH =
    (Math.cos(zenith * rad) - sinDec * Math.sin(lat * rad)) /
    (cosDec * Math.cos(lat * rad));
  if (cosH > 1 || cosH < -1) return null;

  const hourAngle = (Math.acos(cosH) * deg) / 15;
  const localMean = hourAngle + ra - 0.06571 * t - 6.622;
  const ut = mod(localMean - lngHour, 24);
  return new Date(Date.UTC(year, month - 1, day) + ut * 3_600_000);
}

/** Today's date in Mauritius (UTC+4 all year, no summer time). */
export function mauritiusToday(now = new Date()) {
  const local = new Date(now.getTime() + 4 * 3_600_000);
  return {
    year: local.getUTCFullYear(),
    month: local.getUTCMonth() + 1,
    day: local.getUTCDate(),
  };
}

/**
 * Tonight's sunset, or tomorrow's once tonight's has passed, with the start
 * of the golden light before it.
 */
export function nextSunset(lat: number, lng: number, now = new Date()) {
  const { year, month, day } = mauritiusToday(now);
  for (const offset of [0, 1]) {
    const date = new Date(Date.UTC(year, month - 1, day + offset));
    const y = date.getUTCFullYear();
    const m = date.getUTCMonth() + 1;
    const d = date.getUTCDate();
    const sunset = sunsetUtc(y, m, d, lat, lng);
    if (sunset && (offset === 1 || sunset > now)) {
      return {
        tomorrow: offset === 1,
        sunset,
        golden: sunsetUtc(y, m, d, lat, lng, GOLDEN),
      };
    }
  }
  return null;
}
