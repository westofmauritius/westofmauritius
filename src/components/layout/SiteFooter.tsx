import { Container } from "@/components/ui/Container";
import { Wordmark } from "@/components/ui/Wordmark";
import { Link } from "@/i18n/Link";
import { Wave } from "@/components/ui/Wave";
import { PalmFrond } from "@/components/ui/PalmFrond";
import type { NavItem } from "./nav";

type SiteFooterProps = {
  brandName: string;
  tagline: string;
  columns: { title: string; items: NavItem[] }[];
  /** Small print, e.g. copyright. */
  legal: string;
  /** Newsletter sign-up, shown above the link columns. */
  newsletter?: React.ReactNode;
};

/** Deep-ocean footer: the "night" end of the page after the sunset colours. */
export function SiteFooter({
  brandName,
  tagline,
  columns,
  legal,
  newsletter,
}: SiteFooterProps) {
  return (
    <footer className="relative isolate mt-auto bg-ocean-900 text-ocean-100">
      {/* The shore: the warm page meets the deep ocean footer in a wave. */}
      <Wave className="text-ocean-900" />
      {/* Palm fronds against the night sea. Clipped here, not on the footer,
          so the wave above stays visible. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <PalmFrond className="-right-24 -bottom-24 w-80 rotate-[200deg] text-ocean-800 sm:w-[34rem]" />
        <PalmFrond className="top-24 -left-32 hidden w-[26rem] -scale-x-100 rotate-[170deg] text-ocean-800/70 md:block" />
      </div>
      {newsletter && (
        <div data-footer-newsletter className="border-b border-white/10">
          <Container
            size="wide"
            className="max-w-2xl py-14 lg:max-w-7xl lg:[&>div]:max-w-xl"
          >
            {newsletter}
          </Container>
        </div>
      )}
      <Container
        size="wide"
        className="grid gap-12 py-16 md:grid-cols-[1.5fr_repeat(3,1fr)]"
      >
        <div className="max-w-xs">
          <Wordmark name={brandName} tone="light" />
          <p className="mt-4 text-small leading-relaxed text-ocean-200">
            {tagline}
          </p>
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <p className="mb-4 eyebrow text-accent-on-dark">{column.title}</p>
            <ul className="space-y-3 text-small">
              {column.items.map((item) => (
                <li key={item.path}>
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
