/**
 * The baked elevation grid of the west coast (scripts/bake-terrain.py) and
 * how it maps to the 3D scene. One scene unit is 100 m.
 */
export const TERRAIN = {
  src: "/terrain/west-coast.png",
  north: -20.22,
  south: -20.5,
  west: 57.295,
  east: 57.475,
  cols: 192,
  rows: 316,
  /** Grey value 0 is this many metres, 255 is `high`. */
  low: -60,
  high: 840,
  /** Mountains are drawn this much taller than life so the relief reads. */
  exaggeration: 1.8,
} as const;

const KM_PER_DEG_LAT = 110.57;
const KM_PER_DEG_LNG =
  111.32 * Math.cos(((TERRAIN.north + TERRAIN.south) / 2) * (Math.PI / 180));

/** Scene size in units (100 m). */
export const terrainWidth = (TERRAIN.east - TERRAIN.west) * KM_PER_DEG_LNG * 10;
export const terrainDepth =
  (TERRAIN.north - TERRAIN.south) * KM_PER_DEG_LAT * 10;

/** Scene x and z for a latitude and longitude (north is −z, east is +x). */
export function toScene(lat: number, lng: number) {
  return {
    x:
      ((lng - TERRAIN.west) / (TERRAIN.east - TERRAIN.west) - 0.5) *
      terrainWidth,
    z:
      ((TERRAIN.north - lat) / (TERRAIN.north - TERRAIN.south) - 0.5) *
      terrainDepth,
  };
}

/** Metres from a grey value of the heightmap. */
export function greyToMetres(grey: number) {
  return TERRAIN.low + (grey / 255) * (TERRAIN.high - TERRAIN.low);
}

/** Scene height (units) from metres; the sea stays flat at 0. */
export function sceneHeight(metres: number) {
  return (Math.max(0, metres) / 100) * TERRAIN.exaggeration;
}
