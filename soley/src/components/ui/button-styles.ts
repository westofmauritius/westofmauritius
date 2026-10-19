import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "md" | "lg";

/**
 * Shared classes for <Button> and <ButtonLink>. Primary is dark text on sun
 * yellow (10:1 contrast); every size is at least 44 px tall for touch.
 */
export function buttonClasses(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className?: string,
) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors",
    "disabled:cursor-not-allowed disabled:opacity-60",
    size === "lg" ? "min-h-13 px-7 text-lg" : "min-h-11 px-5 text-base",
    variant === "primary" &&
      "bg-sun-400 text-ocean-950 shadow-sm hover:bg-sun-300",
    variant === "secondary" && "bg-ocean-800 text-white hover:bg-ocean-700",
    variant === "ghost" &&
      "border border-ocean-800/25 bg-white/60 text-ocean-900 hover:border-ocean-800/60",
    variant === "danger" && "bg-danger-700 text-white hover:bg-danger-700/90",
    className,
  );
}
