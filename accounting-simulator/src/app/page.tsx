import Link from "next/link";
import { loadScenarios } from "@/scenarios/load";

export default function HomePage() {
  const scenarios = loadScenarios();
  const first = scenarios[0];

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:py-20">
      <section className="max-w-3xl">
        <p className="text-sm font-semibold tracking-wide text-brand uppercase">Accounting practice</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          Learn accounting by doing it.
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-muted">
          Step into the finance team of a small company. Invoices, receipts and bank statements land in your
          inbox. You decide what to do with each one and book it. After every step you see exactly what changed
          in the books and who in the finance department was involved.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            href={`/scenarios/${first.id}`}
            className="rounded-md bg-brand px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Start your first month
          </Link>
          <span className="text-sm text-muted">Free. No account needed. Takes about 45 minutes.</span>
        </div>
      </section>

      <section className="mt-16 grid gap-4 sm:grid-cols-3">
        {[
          {
            title: "Real looking documents",
            text: "Supplier invoices, sales invoices, payroll, bank lines and memos from your colleagues.",
          },
          {
            title: "Your decision, your entry",
            text: "Pick the right action, or build the journal entry yourself. Hints if you get stuck.",
          },
          {
            title: "See the books move",
            text: "Journal, ledger, trial balance, income statement and balance sheet update as you go.",
          },
        ].map((item) => (
          <div key={item.title} className="rounded-lg border border-line bg-white p-5">
            <h2 className="font-semibold text-ink">{item.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{item.text}</p>
          </div>
        ))}
      </section>

      <section className="mt-16">
        <h2 className="text-lg font-semibold text-ink">Scenarios</h2>
        <ul className="mt-4 space-y-3">
          {scenarios.map((s) => (
            <li key={s.id}>
              <Link
                href={`/scenarios/${s.id}`}
                className="flex items-center justify-between gap-4 rounded-lg border border-line bg-white p-5 hover:border-brand"
              >
                <span>
                  <span className="block font-medium text-ink">{s.title}</span>
                  <span className="mt-1 block text-sm text-muted">
                    {s.company.tagline}. {s.period.label}, {s.tasks.length} tasks.
                  </span>
                </span>
                <span aria-hidden className="text-brand">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-16 text-xs leading-relaxed text-muted">
        The companies, people and documents in these scenarios are fictional and made for practice. The
        accounting follows general principles that apply under both IFRS and US GAAP, unless a task says otherwise.
      </p>
    </main>
  );
}
