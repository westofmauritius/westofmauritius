import { describe, expect, it } from "vitest";
import {
  TERRAIN,
  greyToMetres,
  sceneHeight,
  terrainDepth,
  terrainWidth,
  toScene,
} from "./terrain";

describe("terrain mapping", () => {
  it("puts the corners of the grid at the edges of the scene", () => {
    expect(toScene(TERRAIN.north, TERRAIN.west)).toEqual({
      x: -terrainWidth / 2,
      z: -terrainDepth / 2,
    });
    const se = toScene(TERRAIN.south, TERRAIN.east);
    expect(se.x).toBeCloseTo(terrainWidth / 2);
    expect(se.z).toBeCloseTo(terrainDepth / 2);
  });

  it("is roughly to scale: about 19 by 31 km", () => {
    expect(terrainWidth / 10).toBeGreaterThan(18);
    expect(terrainWidth / 10).toBeLessThan(20);
    expect(terrainDepth / 10).toBeGreaterThan(30);
    expect(terrainDepth / 10).toBeLessThan(32);
  });

  it("decodes heights and keeps the sea flat", () => {
    expect(greyToMetres(0)).toBe(-60);
    expect(greyToMetres(255)).toBe(840);
    expect(sceneHeight(-20)).toBe(0);
    expect(sceneHeight(828)).toBeCloseTo(14.9, 1);
  });

  it("places Tamarin north of Le Morne", () => {
    expect(toScene(-20.328, 57.375).z).toBeLessThan(toScene(-20.455, 57.322).z);
  });
});
