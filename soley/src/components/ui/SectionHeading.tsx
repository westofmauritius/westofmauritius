import { cn } from "@/lib/cn";

export function SectionHeading({
  eyebrow,
  title,
  intro,
  id,
  align = "left",
  as: Tag = "h2",
  className,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  id?: string;
  align?: "left" | "center";
  as?: "h1" | "h2";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow && (
        <p className="mb-2 text-sm font-bold tracking-wider text-ocean-600 uppercase">
          {eyebrow}
        </p>
      )}
      <Tag
        id={id}
        className={cn(
          Tag === "h1" ? "text-4xl sm:text-5xl" : "text-3xl sm:text-4xl",
        )}
      >
        {title}
      </Tag>
      {intro && <p className="mt-4 text-lg text-ink-muted">{intro}</p>}
    </div>
  );
}
