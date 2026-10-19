/** A star rating drawn as text, with the number for screen readers. */
export function Stars({ rating, label }: { rating: number; label: string }) {
  const full = Math.round(rating);
  return (
    <span className="inline-flex items-center gap-1">
      <span aria-hidden="true" className="tracking-tight text-sun-600">
        {"★".repeat(full)}
        <span className="text-sand-300">{"★".repeat(5 - full)}</span>
      </span>
      <span className="text-sm">{label}</span>
    </span>
  );
}
