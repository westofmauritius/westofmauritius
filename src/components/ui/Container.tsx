import { cn } from "@/lib/cn";

type ContainerProps = {
  /** "prose" is a narrow column for reading text; "wide" is for grids. */
  size?: "prose" | "default" | "wide";
  className?: string;
  children: React.ReactNode;
};

const widths = {
  prose: "max-w-2xl",
  default: "max-w-6xl",
  wide: "max-w-7xl",
};

/** Centres content and keeps a consistent side gutter on every screen size. */
export function Container({
  size = "default",
  className,
  children,
}: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        widths[size],
        className,
      )}
    >
      {children}
    </div>
  );
}
