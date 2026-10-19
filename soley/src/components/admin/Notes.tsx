import { getLocale, getTranslations } from "next-intl/server";
import { addNoteAction } from "@/app/[locale]/admin/actions";
import { Card, TextArea } from "@/components/ui";
import type { Locale } from "@/i18n/routing";
import { formatDate } from "@/lib/format";
import { listNotes } from "@/lib/services/admin";
import { ActionForm } from "@/components/shared/ActionForm";

/** Internal notes on an installer or a request (calls, visits, agreements). */
export async function Notes({
  subjectType,
  subjectId,
}: {
  subjectType: "installer" | "quote_request";
  subjectId: string;
}) {
  const t = await getTranslations("admin.notes");
  const locale = (await getLocale()) as Locale;
  const notes = await listNotes(subjectType, subjectId);
  return (
    <Card>
      <h2 className="text-xl">{t("title")}</h2>
      <ActionForm
        action={addNoteAction.bind(null, subjectType, subjectId)}
        submitLabel={t("add")}
        variant="secondary"
        resetOnSuccess
        labels={{ body: t("title") }}
        className="mt-4 space-y-3"
      >
        <TextArea
          name="body"
          label={t("add")}
          placeholder={t("placeholder")}
          rows={3}
        />
      </ActionForm>
      {notes.length === 0 ? (
        <p className="mt-4 text-ink-muted">{t("empty")}</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {notes.map((note) => (
            <li key={note.id} className="border-l-4 border-sand-300 pl-3">
              <p className="whitespace-pre-line">{note.body}</p>
              <p className="mt-1 text-sm text-ink-muted">
                {t("by", {
                  author: note.author,
                  date: formatDate(note.created_at, locale),
                })}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
