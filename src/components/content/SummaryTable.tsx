import type { SummaryTable as Table } from "@/lib/content/types";
import { cn } from "@/lib/cn";

/**
 * The "at a glance" table on question and comparison pages. Wide tables
 * scroll inside their own box on phones; the page itself never scrolls
 * sideways. Row names are row headers, so screen readers announce them
 * with every cell.
 */
export function SummaryTable({
  table,
  className,
}: {
  table: Table;
  className?: string;
}) {
  return (
    <div
      className={cn("overflow-x-auto", className)}
      // Focusable so keyboard users can scroll a wide table.
      tabIndex={0}
      role="region"
      aria-label={table.caption || undefined}
    >
      <table className="w-full min-w-[32rem] text-left text-sm">
        {table.caption && (
          <caption className="mb-4 text-left font-display text-2xl">
            {table.caption}
          </caption>
        )}
        {table.headers.length > 0 && (
          <thead>
            <tr className="border-b border-ink/20">
              {table.headers.map((h, i) => (
                <th
                  key={i}
                  scope="col"
                  className="py-3 pr-4 text-xs font-medium tracking-wide text-ink-muted uppercase"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {table.rows.map((row, r) => (
            <tr key={r} className="border-b border-line">
              {row.map((cell, c) =>
                c === 0 ? (
                  <th
                    key={c}
                    scope="row"
                    className="py-3 pr-4 align-top font-medium"
                  >
                    {cell}
                  </th>
                ) : (
                  <td key={c} className="py-3 pr-4 align-top text-ink-muted">
                    {cell}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
