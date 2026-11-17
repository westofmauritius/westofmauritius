"use client";

// Learner progress, saved in localStorage (version 1 has no accounts or
// database). The store is read with useSyncExternalStore so the server
// render and the first browser render agree, and every component that uses
// it updates together.

import { useCallback, useMemo, useSyncExternalStore } from "react";
import type { Scenario, Step, Task } from "@/scenarios/types";
import { stepKey } from "@/scenarios/books";

export interface StepProgress {
  /** Wrong tries so far. Unbalanced entries are refused and do not count. */
  wrong: number;
  done: boolean;
  /** True once the full answer was shown. */
  revealed: boolean;
}

export interface Progress {
  version: 1;
  steps: Record<string, StepProgress>;
}

const EMPTY: Progress = { version: 1, steps: {} };
const storageKey = (scenarioId: string) => `ledger-practice:progress:${scenarioId}`;

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Keeps two open tabs in step.
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function readRaw(scenarioId: string): string | null {
  try {
    return window.localStorage.getItem(storageKey(scenarioId));
  } catch {
    return null; // private mode or blocked storage: play without saving
  }
}

function writeRaw(scenarioId: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(storageKey(scenarioId));
    else window.localStorage.setItem(storageKey(scenarioId), value);
  } catch {
    // Ignore: progress just will not survive a reload.
  }
  memory.set(scenarioId, value);
  listeners.forEach((l) => l());
}

// Fallback when localStorage is unavailable, so the session still works.
const memory = new Map<string, string | null>();

function parse(raw: string | null): Progress {
  if (!raw) return EMPTY;
  try {
    const value = JSON.parse(raw) as Progress;
    return value?.version === 1 && value.steps ? value : EMPTY;
  } catch {
    return EMPTY;
  }
}

export function useProgress(scenarioId: string) {
  const raw = useSyncExternalStore(
    subscribe,
    () => readRaw(scenarioId) ?? memory.get(scenarioId) ?? null,
    () => null,
  );
  const progress = useMemo(() => parse(raw), [raw]);

  const updateStep = useCallback(
    (key: string, change: (current: StepProgress) => StepProgress) => {
      const current = parse(readRaw(scenarioId) ?? memory.get(scenarioId) ?? null);
      const before = current.steps[key] ?? { wrong: 0, done: false, revealed: false };
      const next: Progress = { ...current, steps: { ...current.steps, [key]: change(before) } };
      writeRaw(scenarioId, JSON.stringify(next));
    },
    [scenarioId],
  );

  const reset = useCallback(() => writeRaw(scenarioId, null), [scenarioId]);

  return { progress, updateStep, reset };
}

// Derived views -----------------------------------------------------------------

export type Outcome = "first" | "hint" | "answer";

export function stepOutcome(p: StepProgress | undefined): Outcome | null {
  if (!p?.done) return null;
  if (p.revealed) return "answer";
  return p.wrong === 0 ? "first" : "hint";
}

export type TaskStatus = "new" | "in progress" | "done" | "needs review";

export function taskStatus(task: Task, progress: Progress): TaskStatus {
  const steps = task.steps.map((s) => progress.steps[stepKey(task, s)]);
  const allDone = steps.every((s) => s?.done);
  if (allDone) return steps.some((s) => s?.revealed) ? "needs review" : "done";
  return steps.some((s) => s && (s.done || s.wrong > 0)) ? "in progress" : "new";
}

export function isTaskComplete(task: Task, progress: Progress): boolean {
  return task.steps.every((s) => progress.steps[stepKey(task, s)]?.done);
}

/** Index of the first task that is not finished, or tasks.length when all are. */
export function currentTaskIndex(scenario: Scenario, progress: Progress): number {
  const index = scenario.tasks.findIndex((t) => !isTaskComplete(t, progress));
  return index === -1 ? scenario.tasks.length : index;
}

export function firstOpenStep(task: Task, progress: Progress): Step | undefined {
  return task.steps.find((s) => !progress.steps[stepKey(task, s)]?.done);
}

export function score(scenario: Scenario, progress: Progress) {
  const counts = { first: 0, hint: 0, answer: 0, open: 0 };
  for (const task of scenario.tasks) {
    for (const step of task.steps) {
      const outcome = stepOutcome(progress.steps[stepKey(task, step)]);
      counts[outcome ?? "open"] += 1;
    }
  }
  return { ...counts, total: counts.first + counts.hint + counts.answer + counts.open };
}
