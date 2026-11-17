export function Feedback({
  tone,
  title,
  children,
}: {
  tone: "good" | "bad" | "info";
  title: string;
  children: React.ReactNode;
}) {
  const styles = {
    good: "border-brand/40 bg-brand-soft",
    bad: "border-bad/30 bg-bad-soft",
    info: "border-navy/30 bg-navy-soft",
  }[tone];
  const titleColor = { good: "text-brand", bad: "text-bad", info: "text-navy" }[tone];
  return (
    <div role="status" className={`mt-3 rounded-md border p-4 text-sm leading-relaxed text-ink ${styles}`}>
      <p className={`font-semibold ${titleColor}`}>{title}</p>
      <div className="mt-1">{children}</div>
    </div>
  );
}
