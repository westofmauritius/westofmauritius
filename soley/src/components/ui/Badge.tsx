import { cn } from "@/lib/cn";

export type BadgeTone = "neutral" | "info" | "success" | "warning" | "danger";

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-sm font-semibold",
        tone === "neutral" && "bg-sand-200 text-ocean-900",
        tone === "info" && "bg-ocean-100 text-ocean-800",
        tone === "success" && "bg-success-50 text-success-700",
        tone === "warning" && "bg-warning-50 text-warning-800",
        tone === "danger" && "bg-danger-50 text-danger-700",
        className,
      )}
    >
      {children}
    </span>
  );
}
