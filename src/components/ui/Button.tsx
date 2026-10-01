import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

type Variant = "primary" | "accent" | "outline" | "light";

const variants: Record<Variant, string> = {
  // Deep ocean: the default call to action.
  primary: "bg-ocean-900 text-white hover:bg-ocean-700",
  // Coral: reserved for the most important action on a page (e.g. the lead form).
  accent: "bg-coral-600 text-white hover:bg-coral-700",
  outline:
    "border border-ocean-900/25 text-ocean-900 hover:border-ocean-900 hover:bg-ocean-900/5",
  // For use on top of photos or dark sections.
  light: "bg-white/95 text-ocean-900 hover:bg-white",
};

const base =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 text-sm font-medium tracking-wide transition-colors";

type ButtonLinkProps = React.ComponentProps<typeof Link> & {
  variant?: Variant;
};

/** A link that looks like a button. Most "buttons" on a content site are links. */
export function ButtonLink({
  variant = "primary",
  className,
  ...props
}: ButtonLinkProps) {
  return <Link className={cn(base, variants[variant], className)} {...props} />;
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
