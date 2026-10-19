"use client";

import { useEffect, useRef } from "react";

/**
 * A list of the problems in a form, with links to each field. It takes
 * focus when it appears, so keyboard and screen reader users land on it.
 */
export function ErrorSummary({
  title,
  errors,
}: {
  title: string;
  errors: { field: string; label: string; message: string }[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const signature = errors.map((e) => e.field).join();
  useEffect(() => {
    if (signature) ref.current?.focus();
  }, [signature]);
  if (errors.length === 0) return null;
  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="alert"
      className="rounded-2xl border-l-4 border-danger-700 bg-danger-50 p-4"
    >
      <p className="font-semibold">{title}</p>
      <ul className="mt-2 list-disc pl-5">
        {errors.map((error) => (
          <li key={error.field}>
            <a
              href={`#field-${error.field}`}
              className="text-danger-700 underline underline-offset-2"
            >
              {error.label}: {error.message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
