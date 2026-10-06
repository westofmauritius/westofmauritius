import { roleLabel } from "@/lib/server/admin-data";
import { getStore } from "@/lib/server/store";

const date = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" });

/** People who asked to join the west coast WhatsApp group. */
export default async function AdminWhatsappPage() {
  const store = getStore();
  const entries = store ? await store.listWhatsapp() : [];
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl">WhatsApp group</h1>
          <p className="mt-2 text-small text-ink-muted">
            {entries.length} people asked for an invitation. Each agreed that
            group members can see their number.
          </p>
        </div>
        <a
          download
          href="/api/admin/export/whatsapp"
          className="inline-flex min-h-11 items-center rounded-full bg-ocean-900 px-5 text-small font-medium text-white"
        >
          Export (CSV)
        </a>
      </div>
      <div className="mt-8 overflow-x-auto rounded-2xl bg-white ring-1 ring-line">
        <table className="w-full text-left text-small">
          <thead className="border-b border-line bg-sand-50 text-xs tracking-wide text-ink-muted uppercase">
            <tr>
              {[
                "Name",
                "WhatsApp",
                "Role",
                "Language",
                "Received",
                "Source",
              ].map((h) => (
                <th key={h} scope="col" className="px-4 py-3 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {entries.map((w) => (
              <tr key={w.id}>
                <td className="px-4 py-3">{w.name}</td>
                <td className="px-4 py-3">
                  {/* wa.me opens a chat with the number (digits only). */}
                  <a
                    href={`https://wa.me/${w.phone.replace(/\D/g, "")}`}
                    className="underline"
                  >
                    {w.phone}
                  </a>
                </td>
                <td className="px-4 py-3">{roleLabel(w.role)}</td>
                <td className="px-4 py-3">{w.locale.toUpperCase()}</td>
                <td className="px-4 py-3 text-ink-muted">
                  {date.format(new Date(w.createdAt))}
                </td>
                <td className="px-4 py-3 text-ink-muted">{w.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
