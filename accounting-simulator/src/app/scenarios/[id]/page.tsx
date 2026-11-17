import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { balanceSheet, formatAmount } from "@/engine";
import { booksFor } from "@/scenarios/books";
import { loadScenario, loadScenarios } from "@/scenarios/load";
import { StartButtons } from "@/components/StartButtons";

export const dynamicParams = false;

export function generateStaticParams() {
  return loadScenarios().map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }: PageProps<"/scenarios/[id]">): Promise<Metadata> {
  const { id } = await params;
  return { title: loadScenario(id)?.title };
}

export default async function IntroPage({ params }: PageProps<"/scenarios/[id]">) {
  const { id } = await params;
  const scenario = loadScenario(id);
  if (!scenario) notFound();

  const opening = balanceSheet(booksFor(scenario, () => false));

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:py-14">
      <p className="text-sm font-semibold tracking-wide text-brand uppercase">{scenario.period.label}</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{scenario.title}</h1>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          <section>
            <h2 className="text-lg font-semibold text-ink">The company</h2>
            <p className="mt-1 text-sm text-muted">{scenario.company.tagline}</p>
            <div className="mt-3 space-y-3 leading-relaxed text-ink">
              {scenario.company.about.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-ink">Your role: {scenario.learner.role}</h2>
            <p className="mt-1 text-sm text-muted">You report to {scenario.learner.reportsTo}.</p>
            <div className="mt-3 space-y-3 leading-relaxed text-ink">
              {scenario.learner.about.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </section>

          {scenario.people && (
            <section>
              <h2 className="text-lg font-semibold text-ink">People you will work with</h2>
              <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                {scenario.people.map((person) => (
                  <li key={person.name} className="rounded-lg border border-line bg-white p-4">
                    <p className="font-medium text-ink">{person.name}</p>
                    <p className="text-xs font-semibold text-brand">{person.role}</p>
                    <p className="mt-1 text-sm text-muted">{person.note}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <StartButtons scenario={scenario} />
        </div>

        <aside>
          <div className="overflow-hidden rounded-lg border border-line bg-white">
            <h2 className="bg-navy px-4 py-2.5 text-sm font-semibold text-white">
              Opening balance sheet, 1 March
            </h2>
            <table className="w-full text-sm">
              <tbody>
                <SheetSection title="Assets" lines={opening.assets} total={opening.totalAssets} />
                <SheetSection title="Liabilities" lines={opening.liabilities} total={opening.totalLiabilities} />
                <SheetSection title="Equity" lines={opening.equity} total={opening.totalEquity} />
                <tr className="border-t-2 border-navy font-semibold">
                  <td className="px-4 py-2">Liabilities and equity</td>
                  <td className="num px-4 py-2">{formatAmount(opening.totalLiabilities + opening.totalEquity)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted">
            Amounts are in US dollars. Accumulated depreciation is shown in brackets because it reduces the
            value of the equipment.
          </p>
        </aside>
      </div>
    </main>
  );
}

function SheetSection({
  title,
  lines,
  total,
}: {
  title: string;
  lines: { account: { id: string; name: string }; amount: number }[];
  total: number;
}) {
  return (
    <>
      <tr>
        <th colSpan={2} className="bg-surface px-4 py-1.5 text-left text-xs font-semibold text-muted uppercase">
          {title}
        </th>
      </tr>
      {lines.map((line) => (
        <tr key={line.account.id} className="border-t border-line">
          <td className="px-4 py-1.5">{line.account.name}</td>
          <td className="num px-4 py-1.5">{formatAmount(line.amount)}</td>
        </tr>
      ))}
      <tr className="border-t border-line font-semibold">
        <td className="px-4 py-1.5">Total {title.toLowerCase()}</td>
        <td className="num px-4 py-1.5">{formatAmount(total)}</td>
      </tr>
    </>
  );
}
