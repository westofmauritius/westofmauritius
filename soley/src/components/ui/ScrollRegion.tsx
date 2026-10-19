import { cn } from "@/lib/cn";

/**
 * A container that scrolls sideways (wide tables on phones). It can take
 * keyboard focus so it can be scrolled with the arrow keys (WCAG 2.1.1),
 * and it is labelled for screen readers.
 */
export function ScrollRegion({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      role="region"
      aria-label={label}
      tabIndex={0}
      className={cn("overflow-x-auto", className)}
    >
      {children}
    </div>
  );
}
