import { conversionsBySource } from "@/lib/server/conversions";
import { getStore } from "@/lib/server/store";

/**
 * Which pages turn readers into enquiries, subscribers and WhatsApp members.
 * Umami shows the same events with visitor numbers; this table counts what
 * actually arrived in the database.
 */
export default async function AdminConversionsPage() {
  const store = getStore();
  const [leads, subscribers, whatsapp] = store
    ? await Promise.all([
        store.listLeads({}, 100_000),
        store.listSubscribers(100_000),
        store.listWhatsapp(100_000),
      ])
    : [[], [], []];
  const rows = conversionsBySource(leads, subscribers, whatsapp);

  return (
    <>
      <h1 className="text-4xl">Conversions by page</h1>
      <p className="mt-2 max-w-2xl text-small text-ink-muted">
        Where each enquiry, newsletter sign up and WhatsApp request started.
        Sources name the page or block, e.g. <code>area-tamarin</code> (area
        page), <code>area-living-tamarin</code> (its Living section),{" "}
        <code>guide-…</code>, <code>living-…</code>, <code>footer</code>.
      </p>
      <div className="mt-8 overflow-x-auto rounded-2xl bg-white ring-1 ring-line">
        <table className="w-full text-left text-small">
          <thead className="border-b border-line bg-sand-50 text-xs tracking-wide text-ink-muted uppercase">
            <tr>
              {["Source", "Enquiries", "Newsletter", "WhatsApp", "Total"].map(
                (h) => (
                  <th key={h} scope="col" className="px-4 py-3 font-medium">
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((r) => (
              <tr key={r.source}>
                <th scope="row" className="px-4 py-3 font-medium">
                  {r.source}
                </th>
                <td className="px-4 py-3">{r.leads}</td>
                <td className="px-4 py-3">{r.newsletter}</td>
                <td className="px-4 py-3">{r.whatsapp}</td>
                <td className="px-4 py-3 font-medium">{r.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <p className="px-4 py-6 text-small text-ink-muted">
            No sign ups yet.
          </p>
        )}
      </div>
    </>
  );
}
