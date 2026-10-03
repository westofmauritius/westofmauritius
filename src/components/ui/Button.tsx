import { cn } from "@/lib/cn";

type Variant = "primary" | "accent" | "outline" | "light" | "outlineLight";

export type { Variant };

const variants: Record<Variant, string> = {
  // Deep ocean: the default call to action.
  primary: "bg-ocean-900 text-white hover:bg-ocean-700",
  // Coral: reserved for the most important action on a page (e.g. the lead form).
  accent: "bg-coral-600 text-white hover:bg-coral-700",
  outline:
    "border border-ocean-900/25 text-ocean-900 hover:border-ocean-900 hover:bg-ocean-900/5",
  // For use on top of photos or dark sections.
  light: "bg-white/95 text-ocean-900 hover:bg-white",
  outlineLight:
    "border border-white/60 text-white hover:border-white hover:bg-white/10",
};

const base =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 type-button transition-colors";

/** Button look for elements that are not ButtonLink/Button, e.g. external <a> links. */
export function buttonClass(variant: Variant = "primary", className?: string) {
  return cn(base, variants[variant], className);
}

type ButtonProps = React.ComponentProps<"button"> & { variant?: Variant };

/** A real <button>, for forms and actions that do not navigate. */
export function Button({
  variant = "primary",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(base, variants[variant], "disabled:opacity-50", className)}
      {...props}
    />
  );
}
