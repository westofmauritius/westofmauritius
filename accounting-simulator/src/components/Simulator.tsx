"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { accountsTouched } from "@/engine";
import type { Scenario, Step, Task } from "@/scenarios/types";
import { booksFor, stepEntry, stepKey } from "@/scenarios/books";
import { currentTaskIndex, firstOpenStep, isTaskComplete, useProgress } from "@/lib/progress";
import { formatDate } from "@/lib/format";
import { Inbox } from "./Inbox";
import { BooksPanel } from "./BooksPanel";
import { DocumentView } from "./Documents";
import { ChoiceDecision } from "./ChoiceDecision";
import { EntryBuilder } from "./EntryBuilder";
import { Feedback } from "./Feedback";
import { InvolvedStrip } from "./InvolvedStrip";

/**
 * The three areas of the month: inbox, workspace and books.
 * All book figures are derived from saved progress, so a reload shows the
 * same books.
 */
export function Simulator({ scenario }: { scenario: Scenario }) {
  const router = useRouter();
  const { progress, updateStep } = useProgress(scenario.id);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // The step just answered correctly: its feedback stays on screen until the
  // learner moves on.
  const [justDone, setJustDone] = useState<string | null>(null);
  const [moved, setMoved] = useState<{ accounts: string[]; entryId?: string; flash: number }>({
    accounts: [],
    flash: 0,
  });

  const books = useMemo(() => booksFor(scenario, (key) => !!progress.steps[key]?.done), [scenario, progress]);
  const currentIndex = currentTaskIndex(scenario, progress);
  const allDone = currentIndex >= scenario.tasks.length;
  const task =
    scenario.tasks.find((t) => t.id === selectedId) ?? scenario.tasks[Math.min(currentIndex, scenario.tasks.length - 1)];

  const select = (taskId: string) => {
    setSelectedId(taskId);
    setJustDone(null);
  };

  const goNext = () => {
    setJustDone(null);
    setSelectedId(null);
    if (currentTaskIndex(scenario, progress) >= scenario.tasks.length) router.push(`/scenarios/${scenario.id}/summary`);
  };

  const onCorrect = (t: Task, step: Step) => {
    const key = stepKey(t, step);
    updateStep(key, (p) => ({ ...p, done: true }));
    // Stay on this task so the feedback and the "who was involved" strip
    // remain visible, even though the inbox has moved on to the next task.
    setSelectedId(t.id);
    setJustDone(key);
    const entry = stepEntry(t, step);
    if (entry) setMoved((m) => ({ accounts: accountsTouched([entry]), entryId: entry.id, flash: m.flash + 1 }));
  };

  const onWrong = (t: Task, step: Step) => {
    // Hint after the first wrong try, full answer after the second.
    updateStep(stepKey(t, step), (p) => ({ ...p, wrong: p.wrong + 1, revealed: p.revealed || p.wrong + 1 >= 2 }));
  };

  return (
    <div className="mx-auto grid w-full max-w-[1600px] flex-1 gap-3 p-3 grid-cols-[minmax(0,1fr)] lg:h-[calc(100vh-3.5rem-1px)] lg:flex-none lg:grid-rows-[minmax(0,1fr)] lg:grid-cols-[260px_minmax(0,1fr)_minmax(360px,440px)]">
      <div className="flex max-h-80 min-h-0 flex-col lg:max-h-none">
        <Inbox
          scenario={scenario}
          progress={progress}
          currentIndex={currentIndex}
          selectedId={task.id}
          onSelect={select}
        />
      </div>

      <main className="min-h-0 overflow-y-auto rounded-lg border border-line bg-surface/60 p-4 sm:p-5">
        {allDone && !justDone && (
          <div className="mb-4 rounded-md border border-brand/40 bg-brand-soft p-3 text-sm">
            March is closed.{" "}
            <Link href={`/scenarios/${scenario.id}/summary`} className="font-semibold text-brand underline">
              See your month end summary
            </Link>
          </div>
        )}
        <TaskView
          key={task.id}
          scenario={scenario}
          task={task}
          justDone={justDone}
          progress={progress}
          onCorrect={onCorrect}
          onWrong={onWrong}
          onContinue={() => setJustDone(null)}
          onNext={goNext}
          isLastTask={task.id === scenario.tasks[scenario.tasks.length - 1].id}
        />
      </main>

      <div className="min-h-[480px] lg:min-h-0">
        <BooksPanel books={books} moved={moved.accounts} lastEntryId={moved.entryId} flash={moved.flash} />
      </div>
    </div>
  );
}

interface TaskViewProps {
  scenario: Scenario;
  task: Task;
  justDone: string | null;
  progress: ReturnType<typeof useProgress>["progress"];
  onCorrect: (task: Task, step: Step) => void;
  onWrong: (task: Task, step: Step) => void;
  onContinue: () => void;
  onNext: () => void;
  isLastTask: boolean;
}

function TaskView({ scenario, task, justDone, progress, onCorrect, onWrong, onContinue, onNext, isLastTask }: TaskViewProps) {
  const complete = isTaskComplete(task, progress);
  const justDoneStep = task.steps.find((s) => stepKey(task, s) === justDone);
  const reviewing = complete && !justDoneStep;
  const step = justDoneStep ?? firstOpenStep(task, progress) ?? task.steps[task.steps.length - 1];
  const stepIndex = task.steps.indexOf(step);
  const key = stepKey(task, step);
  const stepProgress = progress.steps[key] ?? { wrong: 0, done: false, revealed: false };
  const documents = step.documents ?? task.documents;
  const lastStepOfTask = stepIndex === task.steps.length - 1;

  return (
    <article>
      <header>
        <p className="text-xs text-muted">
          From {task.from} · {formatDate(task.date)}
        </p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-ink">{task.title}</h1>
        {task.steps.length > 1 && !reviewing && (
          <p className="mt-1 text-xs font-medium text-brand">
            Screen {stepIndex + 1} of {task.steps.length}
            {step.title ? `: ${step.title}` : ""}
          </p>
        )}
      </header>

      {documents.length > 0 && (
        <div className="mt-4 space-y-3">
          {documents.map((doc, i) => (
            <DocumentView key={i} doc={doc} />
          ))}
        </div>
      )}

      {reviewing ? (
        <ReviewTask scenario={scenario} task={task} onNext={onNext} isLastTask={isLastTask} />
      ) : (
        <section aria-label="Your decision" className="mt-5">
          <h2 className="text-sm font-semibold text-ink">Your decision</h2>
          <p className="mt-1 text-sm leading-relaxed text-ink">{step.prompt}</p>
          <div className="mt-3">
            {justDoneStep ? null : step.kind === "choice" ? (
              <ChoiceDecision
                key={key}
                step={step}
                progress={stepProgress}
                onCorrect={() => onCorrect(task, step)}
                onWrong={() => onWrong(task, step)}
              />
            ) : (
              <EntryBuilder
                key={key}
                step={step}
                accounts={scenario.accounts}
                progress={stepProgress}
                onCorrect={() => onCorrect(task, step)}
                onWrong={() => onWrong(task, step)}
              />
            )}
          </div>

          {justDoneStep && (
            <>
              <Feedback tone="good" title={praise(stepProgress)}>
                <p>{step.correctFeedback}</p>
                {step.kind === "entry" && (
                  <p className="mt-2 text-muted">The entry is posted. Look at the books on the right to see what moved.</p>
                )}
              </Feedback>
              {lastStepOfTask && <InvolvedStrip involved={task.involved} />}
              <div className="mt-4">
                {lastStepOfTask ? (
                  <NextButton onNext={onNext} isLastTask={isLastTask} />
                ) : (
                  <button
                    type="button"
                    onClick={onContinue}
                    className="rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-dark"
                  >
                    Continue
                  </button>
                )}
              </div>
            </>
          )}
        </section>
      )}
    </article>
  );
}

function praise(p: { wrong: number; revealed: boolean }) {
  if (p.revealed) return "Done. Worth a second look later.";
  return p.wrong === 0 ? "Correct, first time." : "Correct. You got there.";
}

function NextButton({ onNext, isLastTask }: { onNext: () => void; isLastTask: boolean }) {
  return (
    <button
      type="button"
      onClick={onNext}
      className="rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-dark"
    >
      {isLastTask ? "Close the month and see your summary" : "Next document"}
    </button>
  );
}

/** A finished task, opened again from the inbox. */
function ReviewTask({
  scenario,
  task,
  onNext,
  isLastTask,
}: {
  scenario: Scenario;
  task: Task;
  onNext: () => void;
  isLastTask: boolean;
}) {
  const name = (id: string) => scenario.accounts.find((a) => a.id === id)?.name ?? id;
  return (
    <section aria-label="What you did" className="mt-5">
      <h2 className="text-sm font-semibold text-ink">Done. Here is what happened.</h2>
      <div className="mt-2 space-y-3">
        {task.steps.map((step) => (
          <div key={step.id} className="rounded-md border border-line bg-white p-4 text-sm leading-relaxed">
            {step.title && <p className="font-semibold text-ink">{step.title}</p>}
            <p>{step.explanation}</p>
            {step.kind === "entry" && (
              <ul className="mt-2 text-xs text-muted">
                {step.entry.lines.map((l) => (
                  <li key={l.account} className={l.credit ? "pl-4" : ""}>
                    {l.debit ? "Dr" : "Cr"} {name(l.account)} {(l.debit ?? l.credit)?.toLocaleString("en-US")}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
      <InvolvedStrip involved={task.involved} />
      <div className="mt-4">
        <NextButton onNext={onNext} isLastTask={isLastTask} />
      </div>
    </section>
  );
}
