import { cn } from "@/lib/cn";

/** Centres content with the page gutter. `narrow` suits forms and text. */
export function Container({
  children,
  narrow = false,
  className,
}: {
  children: React.ReactNode;
  narrow?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 sm:px-6",
        narrow ? "max-w-3xl" : "max-w-6xl",
        className,
      )}
    >
      {children}
    </div>
  );
}
