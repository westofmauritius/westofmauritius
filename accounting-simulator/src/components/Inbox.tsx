"use client";

import type { Scenario } from "@/scenarios/types";
import { type Progress, type TaskStatus, taskStatus } from "@/lib/progress";
import { formatDate } from "@/lib/format";

const STATUS_STYLE: Record<TaskStatus, string> = {
  new: "bg-navy-soft text-navy",
  "in progress": "bg-warn-soft text-warn",
  done: "bg-brand-soft text-brand",
  "needs review": "bg-bad-soft text-bad",
};

interface Props {
  scenario: Scenario;
  progress: Progress;
  currentIndex: number;
  selectedId: string | undefined;
  onSelect: (taskId: string) => void;
}

export function Inbox({ scenario, progress, currentIndex, selectedId, onSelect }: Props) {
  const done = Math.min(currentIndex, scenario.tasks.length);
  return (
    <nav aria-label="Inbox" className="flex min-h-0 flex-1 flex-col rounded-lg border border-line bg-white">
      <div className="border-b border-line p-3">
        <h2 className="text-xs font-semibold tracking-wide text-muted uppercase">Inbox, {scenario.period.label}</h2>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface" aria-hidden>
          <div className="h-full bg-brand transition-all" style={{ width: `${(done / scenario.tasks.length) * 100}%` }} />
        </div>
        <p className="mt-1.5 text-xs text-muted">
          {done} of {scenario.tasks.length} tasks done
        </p>
      </div>
      <ol className="min-h-0 flex-1 overflow-y-auto p-1.5">
        {scenario.tasks.map((task, i) => {
          const locked = i > currentIndex;
          const status = taskStatus(task, progress);
          const selected = task.id === selectedId;
          return (
            <li key={task.id}>
              <button
                type="button"
                disabled={locked}
                onClick={() => onSelect(task.id)}
                aria-current={selected ? "true" : undefined}
                className={`w-full rounded-md px-2.5 py-2 text-left disabled:cursor-not-allowed disabled:opacity-45 ${
                  selected ? "bg-brand-soft ring-1 ring-brand/40" : "hover:bg-surface"
                }`}
              >
                <span className="flex items-start justify-between gap-2">
                  <span className="text-xs text-muted">
                    {i + 1}. {task.from}
                  </span>
                  <span className="shrink-0 text-[11px] text-muted">{formatDate(task.date, true)}</span>
                </span>
                <span className={`mt-0.5 block text-sm leading-snug ${status === "new" && !locked ? "font-semibold" : ""}`}>
                  {task.title}
                </span>
                <span className="mt-1 flex items-center justify-between gap-2">
                  <span className="truncate text-xs text-muted">{task.summary}</span>
                  {!locked && (
                    <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold ${STATUS_STYLE[status]}`}>
                      {status}
                    </span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
