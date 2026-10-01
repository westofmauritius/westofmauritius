import Link from "next/link";
import index from "@/lib/generated/content-index.json";
import { budgets, timeframes } from "@/lib/forms/options";
import {
  budgetLabel,
  leadFiltersFrom,
  timeframeLabel,
} from "@/lib/server/admin-data";
import { getStore } from "@/lib/server/store";

const dateTime = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
});

const field =
  "mt-1 block min-h-10 w-full rounded-sm border border-line bg-white px-3 text-sm";

/** All leads, newest first, with filters and CSV export of the filtered list. */
export default async function AdminLeadsPage({
  searchParams,
}: PageProps<"/admin/leads">) {
  const params = await searchParams;
  const filters = leadFiltersFrom(params);
  const store = getStore();
  const leads = store ? await store.listLeads(filters) : [];
  const query = new URLSearchParams(
    Object.entries(filters).filter((e): e is [string, string] => Boolean(e[1])),
  ).toString();

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl">Leads</h1>
          <p className="mt-2 text-sm text-ink-muted">
            {leads.length} {leads.length === 1 ? "lead" : "leads"}
            {query ? " matching the filters" : ""}
            {store?.kind === "memory" && " · in-memory store (development)"}
          </p>
        </div>
        {/* A file download from an API route, not a page: a plain <a> is correct. */}
        <a
          download
          href={`/api/admin/export/leads${query ? `?${query}` : ""}`}
          className="inline-flex min-h-11 items-center rounded-full bg-ocean-900 px-5 text-sm font-medium text-white hover:bg-ocean-700"
        >
          Export CSV
        </a>
      </div>

      {!store && (
        <p className="mt-6 rounded-sm bg-coral-50 p-4 text-sm text-coral-700">
          No database configured (DATABASE_URL). See TODO_OLIVER.md.
        </p>
      )}

      <form
        method="get"
        className="mt-8 grid gap-4 rounded-sm bg-white p-5 ring-1 ring-line sm:grid-cols-3 lg:grid-cols-7"
      >
        <label className="text-xs font-medium sm:col-span-3 lg:col-span-2">
          Search name or e-mail
          <input
            type="search"
            name="q"
            defaultValue={filters.q}
            className={field}
          />
        </label>
        <label className="text-xs font-medium">
          Budget
          <select
            name="budget"
            defaultValue={filters.budget ?? ""}
            className={field}
          >
            <option value="">Any</option>
            {budgets.map((b) => (
              <option key={b} value={b}>
                {budgetLabel(b)}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-medium">
          Timeframe
          <select
            name="timeframe"
            defaultValue={filters.timeframe ?? ""}
            className={field}
          >
            <option value="">Any</option>
            {timeframes.map((v) => (
              <option key={v} value={v}>
                {timeframeLabel(v)}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-medium">
          Area
          <select
            name="area"
            defaultValue={filters.area ?? ""}
            className={field}
          >
            <option value="">Any</option>
            {index.areas.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-medium">
          From
          <input
            type="date"
            name="from"
            defaultValue={filters.from}
            className={field}
          />
        </label>
        <label className="text-xs font-medium">
          To
          <input
            type="date"
            name="to"
            defaultValue={filters.to}
            className={field}
          />
        </label>
        <div className="flex items-end gap-3 sm:col-span-3 lg:col-span-7">
          <button
            type="submit"
            className="min-h-10 rounded-full bg-ocean-900 px-5 text-sm font-medium text-white"
          >
            Filter
          </button>
          <Link
            href="/admin/leads"
            className="text-sm text-ink-muted underline"
          >
            Clear
          </Link>
        </div>
      </form>

      <div className="mt-8 overflow-x-auto rounded-sm bg-white ring-1 ring-line">
        <table className="w-full min-w-[64rem] text-left text-sm">
          <thead className="border-b border-line bg-sand-50 text-xs tracking-wide text-ink-muted uppercase">
            <tr>
              {[
                "Received",
                "Name",
                "Contact",
                "Country",
                "Budget",
                "Timeframe",
                "Areas",
                "Message",
                "Source",
              ].map((h) => (
                <th key={h} scope="col" className="px-4 py-3 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {leads.map((lead) => (
              <tr key={lead.id} className="align-top">
                <td className="px-4 py-3 whitespace-nowrap text-ink-muted">
                  {dateTime.format(new Date(lead.createdAt))}
                </td>
                <td className="px-4 py-3 font-medium">
                  {lead.name}
                  <span className="block text-xs font-normal text-ink-muted">
                    {lead.locale.toUpperCase()}
                    {lead.newsletter && " · newsletter"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <a
                    href={`mailto:${lead.email}`}
                    className="text-lagoon-700 hover:underline"
                  >
                    {lead.email}
                  </a>
                  {lead.phone && (
                    <span className="block text-ink-muted">{lead.phone}</span>
                  )}
                </td>
                <td className="px-4 py-3">{lead.country}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {budgetLabel(lead.budget)}
                </td>
                <td className="px-4 py-3">{timeframeLabel(lead.timeframe)}</td>
                <td className="px-4 py-3">{lead.areas.join(", ") || "—"}</td>
                <td className="max-w-xs px-4 py-3 text-ink-muted">
                  {lead.message ? (
                    <details>
                      <summary className="cursor-pointer">
                        {lead.message.length > 60
                          ? `${lead.message.slice(0, 60)}…`
                          : lead.message}
                      </summary>
                      <p className="mt-2 whitespace-pre-wrap">{lead.message}</p>
                    </details>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-ink-muted">
                  {lead.source || "direct"}
                </td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-10 text-center text-ink-muted"
                >
                  No leads yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
