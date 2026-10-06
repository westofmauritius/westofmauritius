"use client";

import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { track } from "@/lib/analytics";
import { quizResult, type QuizAnswers } from "@/lib/quiz";

type Question = {
  id: string;
  legend: string;
  options: { id: string; label: string }[];
};

/**
 * Three questions, one answer: which west coast village fits you. The
 * result panels are rendered on the server (photo, text, links) and only
 * revealed here, so this script stays tiny. Works with the keyboard and
 * announces the result to screen readers.
 */
export function AreaQuiz({
  questions,
  order,
  results,
  labels,
}: {
  questions: Question[];
  /** Area slugs, north to south: the tie breaker. */
  order: string[];
  results: Record<string, ReactNode>;
  labels: { submit: string; missing: string; again: string };
}) {
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [result, setResult] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (questions.some((q) => !answers[q.id])) {
      setMissing(true);
      return;
    }
    setMissing(false);
    const area = quizResult(answers, order);
    setResult(area);
    track("quiz-complete", { area });
    // Wait for the panel to render, then move focus and view to it.
    requestAnimationFrame(() => {
      resultRef.current?.focus();
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  return (
    <div>
      <form ref={formRef} onSubmit={onSubmit} noValidate className="space-y-10">
        {questions.map((question, i) => (
          <fieldset key={question.id}>
            <legend className="type-h4">
              <span className="mr-3 text-accent">{i + 1}.</span>
              {question.legend}
            </legend>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {question.options.map((option) => (
                <label
                  key={option.id}
                  className="flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border border-line bg-white px-4 py-3 transition-colors hover:border-ocean-900/50 has-[:checked]:border-ocean-900 has-[:checked]:bg-sand-50 has-[:checked]:ring-1 has-[:checked]:ring-ocean-900"
                >
                  <input
                    type="radio"
                    name={question.id}
                    value={option.id}
                    checked={answers[question.id] === option.id}
                    onChange={() =>
                      setAnswers((a) => ({ ...a, [question.id]: option.id }))
                    }
                    className="size-4 shrink-0 accent-ocean-900"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>
        ))}

        {missing && (
          <p role="alert" className="text-small text-coral-700">
            {labels.missing}
          </p>
        )}
        <button
          type="submit"
          className="inline-flex min-h-12 items-center justify-center rounded-full bg-coral-600 px-8 text-small font-medium tracking-wide text-white transition-colors hover:bg-coral-700"
        >
          {labels.submit}
        </button>
      </form>

      <div aria-live="polite">
        {result && (
          <div
            ref={resultRef}
            tabIndex={-1}
            className="mt-16 scroll-mt-24 outline-none"
          >
            {results[result]}
            <button
              type="button"
              onClick={() => {
                setResult(null);
                setAnswers({});
                formRef.current?.scrollIntoView({ behavior: "smooth" });
              }}
              className="mt-6 text-small font-medium text-lagoon-700 underline underline-offset-4"
            >
              {labels.again}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
