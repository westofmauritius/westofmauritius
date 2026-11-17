import { formatAmount, toCents } from "@/engine";
import type {
  BankStatementDoc,
  InvoiceDoc,
  MemoDoc,
  PayrollDoc,
  ReconciliationDoc,
  ScenarioDocument,
} from "@/scenarios/types";
import { formatDate } from "@/lib/format";

// Renders scenario documents so they look like the paper or screen a real
// finance team would see. Each kind has its own small component.

const money = (dollars: number) => formatAmount(toCents(dollars));

const unit = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function DocumentView({ doc }: { doc: ScenarioDocument }) {
  switch (doc.kind) {
    case "invoice":
      return <Invoice doc={doc} />;
    case "bankStatement":
      return <BankStatement doc={doc} />;
    case "memo":
      return <Memo doc={doc} />;
    case "payroll":
      return <Payroll doc={doc} />;
    case "reconciliation":
      return <Reconciliation doc={doc} />;
  }
}

function Paper({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <article aria-label={label} className="overflow-x-auto rounded-md border border-line bg-white p-4 sm:p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      {children}
    </article>
  );
}

function Stamp({ stamp }: { stamp: { text: string; tone: "good" | "warn" | "info" } }) {
  const tone = {
    good: "border-brand text-brand",
    warn: "border-warn text-warn",
    info: "border-navy text-navy",
  }[stamp.tone];
  return (
    <p className={`mt-4 inline-block -rotate-1 rounded border-2 px-3 py-1 text-xs font-bold tracking-wide uppercase ${tone}`}>
      {stamp.text}
    </p>
  );
}

function Invoice({ doc }: { doc: InvoiceDoc }) {
  const prices = doc.showPrices !== false;
  return (
    <Paper label={`${doc.title} ${doc.number}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-base font-semibold text-ink">{doc.from.name}</p>
          {doc.from.address && <p className="text-xs text-muted">{doc.from.address}</p>}
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold tracking-wide text-navy uppercase">{doc.title}</p>
          <p className="text-xs text-muted">No. {doc.number}</p>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:grid-cols-4">
        <Field label="To" value={doc.to.name} />
        <Field label="Date" value={formatDate(doc.date)} />
        {doc.dueDate && <Field label="Due" value={formatDate(doc.dueDate)} />}
        {doc.orderNumber && <Field label="Order" value={doc.orderNumber} />}
      </dl>

      <table className="mt-4 w-full text-sm">
        <thead>
          <tr className="border-b border-line text-left text-xs text-muted">
            <th className="py-1.5 font-medium">Description</th>
            {doc.lines.some((l) => l.quantity !== undefined) && <th className="num py-1.5 font-medium">Qty</th>}
            {prices && doc.lines.some((l) => l.unitPrice !== undefined) && (
              <th className="num py-1.5 font-medium">Unit price</th>
            )}
            {prices && <th className="num py-1.5 font-medium">Amount</th>}
          </tr>
        </thead>
        <tbody>
          {doc.lines.map((line) => (
            <tr key={line.description} className="border-b border-line/70">
              <td className="py-1.5 pr-2">{line.description}</td>
              {doc.lines.some((l) => l.quantity !== undefined) && (
                <td className="num py-1.5">{line.quantity?.toLocaleString("en-US")}</td>
              )}
              {prices && doc.lines.some((l) => l.unitPrice !== undefined) && (
                <td className="num py-1.5">{line.unitPrice !== undefined ? unit.format(line.unitPrice) : ""}</td>
              )}
              {prices && <td className="num py-1.5">{money(line.amount)}</td>}
            </tr>
          ))}
        </tbody>
        {prices && (
          <tfoot>
            <tr className="font-semibold">
              <td className="pt-2" colSpan={10}>
                <div className="flex justify-between">
                  <span>Total USD</span>
                  <span className="num">{money(doc.total)}</span>
                </div>
              </td>
            </tr>
          </tfoot>
        )}
      </table>

      {doc.notes?.map((note) => (
        <p key={note} className="mt-3 text-xs text-muted">
          {note}
        </p>
      ))}
      {doc.stamp && <Stamp stamp={doc.stamp} />}
    </Paper>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted">{label}</dt>
      <dd className="font-medium text-ink">{value}</dd>
    </div>
  );
}

function BankStatement({ doc }: { doc: BankStatementDoc }) {
  return (
    <Paper label={`${doc.bank} statement`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold text-navy">{doc.bank}</p>
          <p className="text-xs text-muted">{doc.accountName}</p>
        </div>
        <p className="text-right text-xs text-muted">
          Statement
          <br />
          <span className="font-medium text-ink">{doc.period}</span>
        </p>
      </div>
      <table className="mt-4 w-full text-sm">
        <thead>
          <tr className="border-b border-line text-left text-xs text-muted">
            <th className="py-1.5 font-medium">Date</th>
            <th className="py-1.5 font-medium">Description</th>
            <th className="num py-1.5 font-medium">Money in</th>
            <th className="num py-1.5 font-medium">Money out</th>
          </tr>
        </thead>
        <tbody>
          {doc.openingBalance !== undefined && (
            <tr className="border-b border-line/70 text-muted">
              <td className="py-1.5" />
              <td className="py-1.5">Opening balance</td>
              <td className="num py-1.5" colSpan={2}>
                {money(doc.openingBalance)}
              </td>
            </tr>
          )}
          {doc.lines.map((line, i) => (
            <tr key={i} className={`border-b border-line/70 ${line.highlight ? "bg-brand-soft" : ""}`}>
              <td className="py-1.5 pr-2 whitespace-nowrap">{formatDate(line.date, true)}</td>
              <td className="py-1.5 pr-2">{line.description}</td>
              <td className="num py-1.5">{line.amount > 0 ? money(line.amount) : ""}</td>
              <td className="num py-1.5">{line.amount < 0 ? money(-line.amount) : ""}</td>
            </tr>
          ))}
          {doc.closingBalance !== undefined && (
            <tr className="font-semibold">
              <td className="py-1.5" />
              <td className="py-1.5">Closing balance</td>
              <td className="num py-1.5" colSpan={2}>
                {money(doc.closingBalance)}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </Paper>
  );
}

function Memo({ doc }: { doc: MemoDoc }) {
  return (
    <Paper label={doc.subject}>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-xs">
        <dt className="text-muted">From</dt>
        <dd className="text-ink">{doc.from}</dd>
        <dt className="text-muted">To</dt>
        <dd className="text-ink">{doc.to}</dd>
        <dt className="text-muted">Date</dt>
        <dd className="text-ink">{formatDate(doc.date)}</dd>
      </dl>
      <p className="mt-3 border-t border-line pt-3 font-semibold text-ink">{doc.subject}</p>
      <div className="mt-2 space-y-2 text-sm leading-relaxed">
        {doc.body.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>
      {doc.table && (
        <table className="mt-3 w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs text-muted">
              {doc.table.headers.map((h, i) => (
                <th key={h} className={`py-1.5 font-medium ${i > 0 && isNumberColumn(doc, i) ? "num" : ""}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {doc.table.rows.map((row, r) => (
              <tr
                key={r}
                className={`border-b border-line/70 ${row[0] === "Total" || String(row[0]).startsWith("Total") ? "font-semibold" : ""}`}
              >
                {row.map((cell, c) => (
                  <td key={c} className={`py-1.5 pr-2 ${typeof cell === "number" ? "num" : ""}`}>
                    {typeof cell === "number" ? money(cell) : cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {doc.stamp && <Stamp stamp={doc.stamp} />}
    </Paper>
  );
}

function isNumberColumn(doc: MemoDoc, column: number) {
  return doc.table!.rows.some((row) => typeof row[column] === "number");
}

function Payroll({ doc }: { doc: PayrollDoc }) {
  return (
    <Paper label={`Payroll ${doc.period}`}>
      <div className="flex items-start justify-between">
        <p className="font-semibold text-navy">Payroll summary, {doc.period}</p>
        <p className="text-xs text-muted">Paid {formatDate(doc.payDate)}</p>
      </div>
      <table className="mt-4 w-full text-sm">
        <thead>
          <tr className="border-b border-line text-left text-xs text-muted">
            <th className="py-1.5 font-medium">Employee</th>
            <th className="py-1.5 font-medium">Role</th>
            <th className="num py-1.5 font-medium">Salary paid</th>
          </tr>
        </thead>
        <tbody>
          {doc.employees.map((e) => (
            <tr key={e.name} className="border-b border-line/70">
              <td className="py-1.5">{e.name}</td>
              <td className="py-1.5 text-muted">{e.role}</td>
              <td className="num py-1.5">{money(e.amount)}</td>
            </tr>
          ))}
          <tr className="font-semibold">
            <td className="pt-2" colSpan={2}>
              Total
            </td>
            <td className="num pt-2">{money(doc.total)}</td>
          </tr>
        </tbody>
      </table>
      {doc.notes?.map((note) => (
        <p key={note} className="mt-2 text-xs text-muted">
          {note}
        </p>
      ))}
    </Paper>
  );
}

function Reconciliation({ doc }: { doc: ReconciliationDoc }) {
  const difference = doc.bookBalance - doc.bankBalance;
  return (
    <Paper label="Bank reconciliation">
      <p className="font-semibold text-navy">Bank reconciliation, {formatDate(doc.date)}</p>
      <table className="mt-3 w-full max-w-sm text-sm">
        <tbody>
          <tr className="border-b border-line/70">
            <td className="py-1.5">Cash in the books</td>
            <td className="num py-1.5">{money(doc.bookBalance)}</td>
          </tr>
          <tr className="border-b border-line/70">
            <td className="py-1.5">Balance on the bank statement</td>
            <td className="num py-1.5">{money(doc.bankBalance)}</td>
          </tr>
          <tr className="font-semibold text-bad">
            <td className="py-1.5">Difference to explain</td>
            <td className="num py-1.5">{money(difference)}</td>
          </tr>
        </tbody>
      </table>
      {doc.notes?.map((note) => (
        <p key={note} className="mt-3 text-sm">
          {note}
        </p>
      ))}
    </Paper>
  );
}
