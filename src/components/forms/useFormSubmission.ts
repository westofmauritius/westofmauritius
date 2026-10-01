"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { track } from "@/lib/analytics";
import { formDataToInput } from "@/lib/forms/form-data";
import type { FieldErrors, FormInput, Result } from "@/lib/forms/validation";

export type SubmissionState =
  "idle" | "sending" | "success" | "rateLimited" | "unavailable" | "network";

type Options = {
  endpoint: string;
  /** The same validation the server runs, for instant feedback. */
  validate: (input: FormInput) => Result<unknown>;
  /** Checkbox groups that should always be sent as lists. */
  listFields?: string[];
  /** Analytics event on success, with optional details from the input. */
  event: string;
  eventData?: (input: FormInput) => Record<string, string | number>;
};

/**
 * Shared submit logic for all forms:
 * 1. validate in the browser and point to the problems (error summary gets focus),
 * 2. send JSON to the API, with the time the form was shown (bot check),
 * 3. show server-side errors the same way, or the success message,
 * 4. record the conversion in analytics.
 */
export function useFormSubmission(options: Options) {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [state, setState] = useState<SubmissionState>("idle");
  const startedAt = useRef(0);
  const summaryRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  // Move focus to the error summary or the success message when they appear,
  // so keyboard and screen-reader users know what happened.
  useEffect(() => {
    if (Object.keys(errors).length > 0) summaryRef.current?.focus();
  }, [errors]);
  useEffect(() => {
    if (state === "success") successRef.current?.focus();
  }, [state]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "sending") return;
    const input = {
      ...formDataToInput(new FormData(event.currentTarget), options.listFields),
      startedAt: String(startedAt.current),
    };

    const result = options.validate(input);
    if (!result.ok) {
      setErrors({ ...result.errors });
      return;
    }

    setErrors({});
    setState("sending");
    try {
      const response = await fetch(options.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(input),
      });
      const body = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        status?: string;
        errors?: FieldErrors;
      };
      if (response.ok && body.ok) {
        setState("success");
        track(options.event, options.eventData?.(input));
      } else if (body.status === "invalid" && body.errors) {
        setErrors({ ...body.errors });
        setState("idle");
      } else if (body.status === "rate-limited") {
        setState("rateLimited");
      } else {
        setState("unavailable");
      }
    } catch {
      setState("network");
    }
  }

  return { errors, state, onSubmit, summaryRef, successRef };
}
