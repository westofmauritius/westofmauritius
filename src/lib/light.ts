/**
 * "Living light": the site's tints follow the real time of day in Tamarin.
 *
 * `lightPhase` is deliberately self contained (no imports, no outside
 * constants): its source text is also inlined as a tiny script in the page
 * head (see LivingLight), so the right light is set before the first paint
 * and nothing flashes. It repeats the sunrise equation from src/lib/sun.ts
 * (US Naval Observatory, accurate to a minute or two) for both sunrise and
 * sunset.
 */

export type LightPhase = "morning" | "day" | "golden" | "dusk" | "night";

/** Tamarin's bay: the middle of the coast this site is about. */
export const LIGHT_PLACE = { lat: -20.325, lng: 57.373 };

export function lightPhase(
  lat: number,
  lng: number,
  nowMs: number,
): "morning" | "day" | "golden" | "dusk" | "night" {
  const rad = Math.PI / 180;
  const mod = function (n: number, m: number) {
    return ((n % m) + m) % m;
  };
  // Mauritius is UTC+4 all year: the local calendar day.
  const local = new Date(nowMs + 4 * 3600000);
  const y = local.getUTCFullYear();
  const mo = local.getUTCMonth();
  const d = local.getUTCDate();
  const n = Math.round((Date.UTC(y, mo, d) - Date.UTC(y, 0, 0)) / 86400000);
  const lngHour = lng / 15;
  // When the sun crosses `zenith` degrees, rising or setting, in UTC ms.
  const event = function (zenith: number, rising: boolean) {
    const t = n + ((rising ? 6 : 18) - lngHour) / 24;
    const m = 0.9856 * t - 3.289;
    const l = mod(
      m + 1.916 * Math.sin(m * rad) + 0.02 * Math.sin(2 * m * rad) + 282.634,
      360,
    );
    let ra = mod(Math.atan(0.91764 * Math.tan(l * rad)) / rad, 360);
    ra = (ra + Math.floor(l / 90) * 90 - Math.floor(ra / 90) * 90) / 15;
    const sinDec = 0.39782 * Math.sin(l * rad);
    const cosDec = Math.cos(Math.asin(sinDec));
    const cosH =
      (Math.cos(zenith * rad) - sinDec * Math.sin(lat * rad)) /
      (cosDec * Math.cos(lat * rad));
    const h = Math.acos(Math.max(-1, Math.min(1, cosH))) / rad;
    const hour = (rising ? 360 - h : h) / 15 + ra - 0.06571 * t - 6.622;
    // Local mean time to UTC; keep it on this local day (UTC+4).
    const ut = mod(hour - lngHour + 4, 24) - 4;
    return Date.UTC(y, mo, d) + ut * 3600000;
  };
  const min = 60000;
  const sunrise = event(90.833, true);
  const sunset = event(90.833, false);
  const golden = event(84, false); // sun 6 degrees above the horizon
  if (nowMs >= sunrise - 30 * min && nowMs < sunrise + 150 * min)
    return "morning";
  if (nowMs >= sunrise + 150 * min && nowMs < golden - 20 * min) return "day";
  if (nowMs >= golden - 20 * min && nowMs < sunset) return "golden";
  if (nowMs >= sunset && nowMs < sunset + 45 * min) return "dusk";
  return "night";
}

/**
 * The inline head script: sets <html data-light="…"> before the first
 * paint. Wrapped in try so a failure simply leaves the default (day) light.
 */
export function lightScript() {
  return `try{document.documentElement.dataset.light=(${lightPhase.toString()})(${LIGHT_PLACE.lat},${LIGHT_PLACE.lng},Date.now())}catch(e){}`;
}
