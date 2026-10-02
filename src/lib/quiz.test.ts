import { readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { quizQuestions, quizResult } from "./quiz";

const order = [
  "flic-en-flac",
  "tamarin",
  "black-river",
  "la-gaulette",
  "le-morne",
  "chamarel",
];

describe("quiz", () => {
  it("only points to areas that exist", () => {
    const areas = readdirSync("content/areas");
    for (const q of quizQuestions)
      for (const o of q.options)
        for (const slug of o.areas) expect(areas).toContain(slug);
  });

  it("every area can come out on top", () => {
    const winners = new Set<string>();
    for (const a of quizQuestions[0].options)
      for (const b of quizQuestions[1].options)
        for (const c of quizQuestions[2].options)
          winners.add(
            quizResult({ sea: a.id, pace: b.id, sunday: c.id }, order),
          );
    expect([...winners].sort()).toEqual([...order].sort());
  });

  it("picks the clear match", () => {
    expect(
      quizResult({ sea: "hills", pace: "nature", sunday: "hike" }, order),
    ).toBe("chamarel");
    expect(
      quizResult({ sea: "surf", pace: "village", sunday: "dolphins" }, order),
    ).toBe("tamarin");
  });
});
