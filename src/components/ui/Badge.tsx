import { cn } from "@/lib/cn";

type BadgeProps = {
  variant: "featured" | "placeholder" | "category";
  children: React.ReactNode;
  className?: string;
};

const variants = {
  // Paid or editorial "featured" placement. Kept subtle so the site still
  // reads as a magazine, not an ad portal.
  featured: "bg-sand-100 text-ocean-900 ring-1 ring-sand-300",
  // Marks invented layout content. Deliberately loud so it is never mistaken
  // for real information.
  placeholder:
    "border border-dashed border-coral-400 bg-coral-50 text-coral-700",
  category: "bg-white/90 text-ocean-900",
};

export function Badge({ variant, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[0.6875rem] font-medium tracking-[0.12em] uppercase",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
