import type { Involvement } from "@/scenarios/types";

/** Who touched this document, in order. Shows that accounting is teamwork. */
export function InvolvedStrip({ involved }: { involved: Involvement[] }) {
  return (
    <section aria-label="Who was involved" className="mt-5 rounded-md border border-line bg-white p-4">
      <h3 className="text-xs font-semibold tracking-wide text-muted uppercase">Who was involved</h3>
      <ol className="mt-3 flex flex-wrap items-stretch gap-2">
        {involved.map((person, i) => (
          <li key={i} className="flex items-stretch gap-2">
            <div
              className={`w-44 rounded-md border p-2.5 text-xs ${
                person.you ? "border-brand bg-brand-soft" : "border-line bg-surface"
              }`}
            >
              <p className="flex items-center justify-between gap-1">
                <span className="font-semibold text-navy">
                  {i + 1}. {person.role}
                </span>
                {person.you && (
                  <span className="rounded bg-brand px-1.5 py-0.5 text-[10px] font-semibold text-white">You</span>
                )}
              </p>
              <p className="mt-1 leading-snug text-ink">{person.action}</p>
            </div>
            {i < involved.length - 1 && (
              <span aria-hidden className="self-center text-muted">
                →
              </span>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
