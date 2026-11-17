"use client";

import Link from "next/link";
import type { Scenario } from "@/scenarios/types";
import { currentTaskIndex, useProgress } from "@/lib/progress";

/** Start, or continue where the learner left off. */
export function StartButtons({ scenario }: { scenario: Scenario }) {
  const { progress, reset } = useProgress(scenario.id);
  const index = currentTaskIndex(scenario, progress);
  const started = Object.keys(progress.steps).length > 0;
  const finished = index >= scenario.tasks.length;
  const play = `/scenarios/${scenario.id}/play`;

  const primary =
    "rounded-md bg-brand px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";
  const secondary = "rounded-md border border-line bg-white px-4 py-3 text-sm font-medium text-ink hover:border-muted";

  if (!started) {
    return (
      <Link href={play} className={`inline-block ${primary}`}>
        Open your inbox
      </Link>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {finished ? (
        <Link href={`/scenarios/${scenario.id}/summary`} className={primary}>
          See your month end summary
        </Link>
      ) : (
        <Link href={play} className={primary}>
          Continue with task {index + 1} of {scenario.tasks.length}
        </Link>
      )}
      <button
        type="button"
        className={secondary}
        onClick={() => {
          if (window.confirm("Start the month again? Your answers so far will be cleared.")) reset();
        }}
      >
        Start again
      </button>
    </div>
  );
}
