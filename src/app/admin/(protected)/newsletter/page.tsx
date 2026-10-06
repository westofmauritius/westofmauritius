import { getStore } from "@/lib/server/store";

const date = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" });

export default async function AdminNewsletterPage() {
  const store = getStore();
  const subscribers = store ? await store.listSubscribers() : [];
  const active = subscribers.filter((s) => s.confirmedAt && !s.unsubscribedAt);
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl">Newsletter</h1>
          <p className="mt-2 text-small text-ink-muted">
            {active.length} confirmed · {subscribers.length} in total
            (unconfirmed signups must not be emailed)
          </p>
        </div>
        {/* A file download from an API route, not a page: a plain <a> is correct. */}
        <a
          download
          href="/api/admin/export/newsletter"
          className="inline-flex min-h-11 items-center rounded-full bg-ocean-900 px-5 text-small font-medium text-white"
        >
          Export confirmed (CSV)
        </a>
      </div>
      <div className="mt-8 overflow-x-auto rounded-2xl bg-white ring-1 ring-line">
        <table className="w-full text-left text-small">
          <thead className="border-b border-line bg-sand-50 text-xs tracking-wide text-ink-muted uppercase">
            <tr>
              {["Email", "Language", "Signed up", "Source", "Status"].map(
                (h) => (
                  <th key={h} scope="col" className="px-4 py-3 font-medium">
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {subscribers.map((s) => (
              <tr key={s.id}>
                <td className="px-4 py-3">{s.email}</td>
                <td className="px-4 py-3">{s.locale.toUpperCase()}</td>
                <td className="px-4 py-3 text-ink-muted">
                  {date.format(new Date(s.createdAt))}
                </td>
                <td className="px-4 py-3 text-ink-muted">{s.source}</td>
                <td className="px-4 py-3">
                  {s.unsubscribedAt
                    ? "Unsubscribed"
                    : s.confirmedAt
                      ? "Confirmed"
                      : "Awaiting confirmation"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
