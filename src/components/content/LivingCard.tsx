import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/Badge";
import { Link } from "@/i18n/Link";
import type { LivingArticle } from "@/lib/content/types";

/** Quiet text card for a Living in the West article. */
export async function LivingCard({ article }: { article: LivingArticle }) {
  const t = await getTranslations();
  return (
    <article className="group reveal relative flex h-full flex-col rounded-2xl border border-line bg-white p-6 shadow-sm transition duration-300 hover:[transform:translateY(-0.25rem)] hover:shadow-xl hover:shadow-ocean-900/10">
      {article.placeholder && (
        <Badge variant="placeholder" className="mb-4 self-start">
          {t("Placeholder.label")}
        </Badge>
      )}
      <h3 className="text-2xl leading-tight">
        <Link
          href={{ pathname: "/living-in-the-west/[slug]", params: { slug: article.slug } }}
          className="after:absolute after:inset-0 group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4"
        >
          {article.title}
        </Link>
      </h3>
      {article.excerpt && <p className="mt-3 leading-relaxed text-ink-muted">{article.excerpt}</p>}
      <span aria-hidden="true" className="mt-auto pt-6 text-small font-medium text-lagoon-700">
        {t("LivePage.readMore")} →
      </span>
    </article>
  );
}
