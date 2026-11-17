"use client";

import { useState } from "react";
import type { ChoiceStep } from "@/scenarios/types";
import type { StepProgress } from "@/lib/progress";
import { Feedback } from "./Feedback";

interface Props {
  step: ChoiceStep;
  progress: StepProgress;
  onWrong: () => void;
  onCorrect: () => void;
}

export function ChoiceDecision({ step, progress, onWrong, onCorrect }: Props) {
  const [picked, setPicked] = useState<string | null>(null);
  const [lastWrong, setLastWrong] = useState<string | null>(null);

  const submit = () => {
    if (!picked) return;
    if (picked === step.answer) {
      onCorrect();
    } else {
      setLastWrong(picked);
      onWrong();
    }
  };

  const wrongOption = step.options.find((o) => o.id === lastWrong);

  return (
    <div>
      <fieldset>
        <legend className="sr-only">{step.prompt}</legend>
        <div className="space-y-2">
          {step.options.map((option) => {
            const isAnswer = progress.revealed && option.id === step.answer;
            return (
              <label
                key={option.id}
                className={`flex cursor-pointer items-start gap-3 rounded-md border bg-white p-3 text-sm hover:border-muted ${
                  picked === option.id ? "border-brand ring-1 ring-brand" : "border-line"
                } ${isAnswer ? "bg-brand-soft" : ""}`}
              >
                <input
                  type="radio"
                  name={step.id}
                  value={option.id}
                  checked={picked === option.id}
                  onChange={() => setPicked(option.id)}
                  className="mt-0.5 accent-brand"
                />
                <span>
                  {option.label}
                  {isAnswer && <span className="ml-2 text-xs font-semibold text-brand">Right answer</span>}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {wrongOption && (
        <Feedback tone="bad" title="Not quite.">
          <p>{wrongOption.feedback}</p>
        </Feedback>
      )}

      {progress.wrong >= 1 && !progress.revealed && (
        <Feedback tone="info" title="Hint">
          <p>{step.hint}</p>
        </Feedback>
      )}

      {progress.revealed && (
        <Feedback tone="info" title="Here is the answer.">
          <p>{step.explanation}</p>
          <p className="mt-2 text-muted">Pick the right answer to carry on.</p>
        </Feedback>
      )}

      <div className="mt-4">
        <button
          type="button"
          onClick={submit}
          disabled={!picked}
          className="rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          Check my answer
        </button>
      </div>
    </div>
  );
}
