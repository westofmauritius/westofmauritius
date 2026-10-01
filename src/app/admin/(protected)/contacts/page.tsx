import { topicLabel } from "@/lib/server/admin-data";
import { getStore } from "@/lib/server/store";

const dateTime = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function AdminContactsPage() {
  const store = getStore();
  const messages = store ? await store.listContacts() : [];
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-4xl">Contact messages</h1>
        {/* A file download from an API route, not a page: a plain <a> is correct. */}
        <a
          download
          href="/api/admin/export/contacts"
          className="inline-flex min-h-11 items-center rounded-full bg-ocean-900 px-5 text-sm font-medium text-white"
        >
          Export CSV
        </a>
      </div>
      <ul className="mt-8 space-y-4">
        {messages.map((m) => (
          <li key={m.id} className="rounded-sm bg-white p-5 ring-1 ring-line">
            <p className="text-sm">
              <strong>{m.name}</strong> ·{" "}
              <a
                href={`mailto:${m.email}`}
                className="text-lagoon-700 hover:underline"
              >
                {m.email}
              </a>{" "}
              · {topicLabel(m.topic)} · {m.locale.toUpperCase()}
              <span className="float-right text-ink-muted">
                {dateTime.format(new Date(m.createdAt))}
              </span>
            </p>
            <p className="mt-3 text-sm whitespace-pre-wrap text-ink-muted">
              {m.message}
            </p>
          </li>
        ))}
        {messages.length === 0 && (
          <li className="text-ink-muted">No messages yet.</li>
        )}
      </ul>
    </>
  );
}
