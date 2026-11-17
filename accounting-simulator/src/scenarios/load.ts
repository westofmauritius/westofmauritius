// Reads every scenario file in src/scenarios/data at build time.
// To add a scenario, drop a new JSON file in that folder. Nothing else.
// Server only: it uses the file system. Pages pass the data to the browser.

import fs from "node:fs";
import path from "node:path";
import type { Scenario } from "./types";
import { validateScenario } from "./books";

const DATA_DIR = path.join(process.cwd(), "src", "scenarios", "data");

export function loadScenarios(dir = DATA_DIR): Scenario[] {
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
  const scenarios = files.map((file) => {
    const scenario = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8")) as Scenario;
    const problems = validateScenario(scenario);
    if (problems.length > 0) {
      throw new Error(`Scenario file ${file} has problems:\n${problems.join("\n")}`);
    }
    return scenario;
  });
  return scenarios.sort((a, b) => a.order - b.order);
}

export function loadScenario(id: string): Scenario | undefined {
  return loadScenarios().find((s) => s.id === id);
}
