import { Container } from "@/components/ui/Container";
import { Wordmark } from "@/components/ui/Wordmark";
import { Link } from "@/i18n/navigation";
import type { NavItem } from "./nav";

type SiteFooterProps = {
  brandName: string;
  tagline: string;
  columns: { title: string; items: NavItem[] }[];
  /** Small print, e.g. copyright. */
  legal: string;
};

/** Deep-ocean footer: the "night" end of the page after the sunset colours. */
export function SiteFooter({
  brandName,
  tagline,
  columns,
  legal,
}: SiteFooterProps) {
  return (
    <footer className="mt-auto bg-ocean-900 text-ocean-100">
      <Container
        size="wide"
        className="grid gap-12 py-16 md:grid-cols-[1.5fr_repeat(3,1fr)]"
      >
        <div className="max-w-xs">
          <Wordmark name={brandName} tone="light" />
          <p className="mt-4 text-sm leading-relaxed text-ocean-200">
            {tagline}
          </p>
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <p className="mb-4 eyebrow text-ocean-300">{column.title}</p>
            <ul className="space-y-3 text-sm">
              {column.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="transition-colors hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>
      <div className="border-t border-white/10">
        <Container size="wide" className="py-6 text-xs text-ocean-300">
          {legal}
        </Container>
      </div>
    </footer>
  );
}
