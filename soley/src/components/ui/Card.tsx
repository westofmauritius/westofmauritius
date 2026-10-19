import { cn } from "@/lib/cn";

export function Card({
  children,
  className,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "article" | "section" | "li";
}) {
  return (
    <Tag
      className={cn(
        "rounded-card border border-line bg-white p-5 shadow-[0_1px_2px_rgba(10,46,74,0.06)] sm:p-6",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
