import { Link } from "@/i18n/Link";
import type { Area } from "@/lib/content/types";
import { Photo } from "@/components/ui/Photo";

/**
 * A column of area photos beside a page's text. The About and author pages
 * are mostly words; these pictures of the villages make them feel like the
 * coast they describe, and each one leads to its area page.
 */
export function AreaPhotoStrip({ areas }: { areas: Area[] }) {
  return (
    <ul className="grid grid-cols-2 gap-4 lg:grid-cols-1 lg:gap-6">
      {areas.map((area) => (
        <li key={area.slug}>
          <Link
            href={{ pathname: "/areas/[slug]", params: { slug: area.slug } }}
            className="group block"
          >
            <Photo
              photo={area.hero}
              fallbackTone={area.placeholderTone}
              fallbackLabel={area.name}
              aspect="aspect-[4/3]"
              sizes="(min-width: 1024px) 20rem, 50vw"
             
            />
            <p className="mt-2 type-h4 text-ink group-hover:text-lagoon-700">
              {area.name}
            </p>
            <p className="text-small text-ink-muted">{area.tagline}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
