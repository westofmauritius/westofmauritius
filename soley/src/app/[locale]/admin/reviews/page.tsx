import { getTranslations } from "next-intl/server";
import { ActionForm } from "@/components/admin/ActionForm";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Badge, Card, RadioCards, TextField } from "@/components/ui";
import { resolveLocale } from "@/i18n/locale";
import { requireAdmin } from "@/lib/auth/roles";
import { getDb } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { moderateReviewAction } from "../actions";

export default async function AdminReviews({
  params,
}: PageProps<"/[locale]/admin/reviews">) {
  const locale = await resolveLocale(params);
  await requireAdmin(locale, "/admin/reviews");
  const t = await getTranslations("admin.reviews");
  const tc = await getTranslations("common");
  const db = getDb();
  const [reviews, installers, requests] = await Promise.all([
    db.select("reviews", {}, { orderBy: "created_at", ascending: false }),
    db.select("installers"),
    db.select("quote_requests"),
  ]);
  const pending = reviews.filter((r) => r.status === "pending");
  const done = reviews.filter((r) => r.status !== "pending");
  const context = (installerId: string, requestId: string) =>
    t("for", {
      company:
        installers.find((i) => i.id === installerId)?.company_name ?? "—",
      reference: requests.find((r) => r.id === requestId)?.reference ?? "—",
    });

  return (
    <div className="space-y-8">
      <h1 className="text-3xl">{t("title")}</h1>
      <p className="max-w-3xl text-ink-muted">{t("intro")}</p>
      <section aria-labelledby="pending" className="space-y-4">
        <h2 id="pending" className="text-xl">
          {t("pending")} ({pending.length})
        </h2>
        {pending.length === 0 && <p className="text-ink-muted">{t("empty")}</p>}
        {pending.map((review) => (
          <Card key={review.id}>
            <p className="text-sm text-ink-muted">
              {context(review.installer_id, review.quote_request_id)}
            </p>
            <p className="mt-2 text-lg font-bold">
              {"★".repeat(review.rating)}
              <span className="sr-only">{review.rating} / 5</span>
              {review.title && <span className="ml-2">{review.title}</span>}
            </p>
            <p className="mt-2 whitespace-pre-line">{review.body}</p>
            <p className="mt-2 text-sm text-ink-muted">
              {review.author_display_name},{" "}
              {formatDate(review.created_at, locale)}
            </p>
            <ActionForm
              action={moderateReviewAction.bind(null, review.id)}
              submitLabel={tc("save")}
              variant="secondary"
              className="mt-4 space-y-3 border-t border-line pt-4"
            >
              <RadioCards
                legend={t("title")}
                name={`decision`}
                options={[
                  { value: "approved", label: t("approve") },
                  { value: "rejected", label: t("reject") },
                ]}
                required
              />
              <TextField name="note" label={t("note")} />
            </ActionForm>
          </Card>
        ))}
      </section>
      <section aria-labelledby="done" className="space-y-3">
        <h2 id="done" className="text-xl">
          {t("done")} ({done.length})
        </h2>
        <ul className="divide-y divide-line rounded-card border border-line bg-white">
          {done.map((review) => (
            <li
              key={review.id}
              className="flex flex-wrap items-center justify-between gap-2 p-4"
            >
              <span>
                <span className="font-semibold">
                  {"★".repeat(review.rating)}
                </span>{" "}
                {review.title ?? review.body.slice(0, 60)}
                <span className="block text-sm text-ink-muted">
                  {context(review.installer_id, review.quote_request_id)}
                </span>
              </span>
              <span className="flex items-center gap-2">
                {review.is_demo && <Badge tone="warning">{tc("demo")}</Badge>}
                <StatusBadge kind="review" status={review.status} />
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
