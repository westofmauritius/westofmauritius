import { cn } from "@/lib/cn";

/**
 * A highlighted message. `role` is set by the caller: "status" for
 * confirmations that should be announced politely, "alert" for errors.
 */
export function Alert({
  children,
  tone = "info",
  title,
  role,
  className,
}: {
  children?: React.ReactNode;
  tone?: "info" | "success" | "warning" | "danger";
  title?: string;
  role?: "status" | "alert";
  className?: string;
}) {
  return (
    <div
      role={role}
      className={cn(
        "rounded-2xl border-l-4 p-4",
        tone === "info" && "border-ocean-500 bg-ocean-50",
        tone === "success" && "border-success-700 bg-success-50",
        tone === "warning" && "border-sun-500 bg-warning-50",
        tone === "danger" && "border-danger-700 bg-danger-50",
        className,
      )}
    >
      {title && <p className="font-semibold">{title}</p>}
      {children && (
        <div className={cn(title && "mt-1", "text-[0.95rem]")}>{children}</div>
      )}
    </div>
  );
}
