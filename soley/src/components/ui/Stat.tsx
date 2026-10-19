import { cn } from "@/lib/cn";

/** A big, clear number with a label: "MUR 75,000 — maximum grant". */
export function Stat({
  value,
  label,
  hint,
  emphasis = false,
  className,
}: {
  value: string;
  label: string;
  hint?: string;
  emphasis?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl p-4",
        emphasis ? "bg-ocean-900 text-white" : "bg-sand-100",
        className,
      )}
    >
      <dt
        className={cn(
          "text-sm font-medium",
          emphasis ? "text-ocean-100" : "text-ink-muted",
        )}
      >
        {label}
      </dt>
      <dd className="mt-1 text-2xl font-bold tabular-nums sm:text-3xl">
        {value}
      </dd>
      {hint && (
        <dd
          className={cn(
            "mt-1 text-sm",
            emphasis ? "text-ocean-100" : "text-ink-muted",
          )}
        >
          {hint}
        </dd>
      )}
    </div>
  );
}
