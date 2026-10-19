/**
 * Questions and answers as native <details> elements: keyboard and screen
 * reader friendly with no JavaScript.
 */
export function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="divide-y divide-line rounded-card border border-line bg-white">
      {items.map((item) => (
        <details key={item.q} className="group p-5">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold">
            {item.q}
            <span
              aria-hidden="true"
              className="text-2xl text-ocean-600 transition-transform group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <p className="mt-3 text-ink-muted">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
