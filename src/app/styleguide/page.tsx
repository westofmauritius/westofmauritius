import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Badge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Wordmark } from "@/components/ui/Wordmark";
import { brandName } from "@/lib/site";

// Internal page for reviewing the design system. Not linked from the site and
// hidden from search engines.
export const metadata: Metadata = {
  title: "Style guide · West Mauritius",
  robots: { index: false, follow: false },
};

const palettes = [
  { name: "lagoon", steps: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] },
  {
    name: "ocean",
    steps: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
  },
  { name: "sand", steps: [50, 100, 200, 300, 400, 500] },
  { name: "coral", steps: [50, 100, 200, 300, 400, 500, 600, 700] },
];

// Example data only — the real navigation is built from the language config in step 3.
const navItems = [
  { label: "Areas", href: "#areas" },
  { label: "Guides", href: "#guides" },
  { label: "Live in the West", href: "#live" },
  { label: "About", href: "#about" },
];

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-line py-14">
      <p className="mb-8 eyebrow text-coral-600">{title}</p>
      {children}
    </section>
  );
}

export default function StyleguidePage() {
  return (
    <>
      <SiteHeader brandName={brandName.en} homeHref="/" items={navItems} />

      <main>
        <Container className="py-12">
          <SectionHeading
            as="h1"
            eyebrow="Internal"
            title="Style guide"
            intro="Colours, type and components for West Mauritius. Everything here comes from src/app/globals.css and src/components/ui."
          />

          <Section title="Wordmark">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col items-start gap-6 rounded-sm bg-white p-8 ring-1 ring-line">
                <Wordmark name={brandName.en} className="text-3xl" />
                <Wordmark name={brandName.fr} className="text-3xl" />
              </div>
              <div className="flex flex-col items-start gap-6 rounded-sm bg-ocean-900 p-8">
                <Wordmark
                  name={brandName.en}
                  tone="light"
                  className="text-3xl"
                />
                <Wordmark
                  name={brandName.fr}
                  tone="light"
                  className="text-3xl"
                />
              </div>
            </div>
          </Section>

          <Section title="Colours">
            <div className="space-y-6">
              {palettes.map((palette) => (
                <div key={palette.name}>
                  <p className="mb-2 text-sm font-medium capitalize">
                    {palette.name}
                  </p>
                  <div className="grid grid-cols-5 gap-2 sm:grid-cols-11">
                    {palette.steps.map((step) => (
                      <div key={step}>
                        <div
                          className="h-12 rounded-sm ring-1 ring-black/5"
                          style={{
                            background: `var(--color-${palette.name}-${step})`,
                          }}
                        />
                        <p className="mt-1 text-[0.6875rem] text-ink-muted">
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Typography">
            <div className="space-y-8">
              <div>
                <p className="mb-2 text-xs text-ink-muted">
                  text-display-1 · Cormorant Garamond
                </p>
                <p className="font-display text-display-1">
                  Where the sun sets on the lagoon
                </p>
              </div>
              <div>
                <p className="mb-2 text-xs text-ink-muted">text-display-2</p>
                <p className="font-display text-display-2">
                  Le Morne and the southwest
                </p>
              </div>
              <div>
                <p className="mb-2 text-xs text-ink-muted">
                  text-display-3 · italic
                </p>
                <p className="font-display text-display-3 italic">
                  A slower pace on the west coast
                </p>
              </div>
              <div className="max-w-2xl">
                <p className="mb-2 text-xs text-ink-muted">Body · Inter</p>
                <p className="text-lg leading-relaxed">
                  Lead paragraph. Placeholder text: this is where an
                  introduction to an area or a guide will go, written in a calm,
                  editorial voice.
                </p>
                <p className="mt-4 leading-relaxed text-ink-muted">
                  Body text. Placeholder text used to check line length, spacing
                  and colour. Comfortable reading needs about 60–75 characters
                  per line, which is why long text sits in the narrow “prose”
                  container.
                </p>
              </div>
            </div>
          </Section>

          <Section title="Buttons and badges">
            <div className="flex flex-wrap items-center gap-3">
              <ButtonLink href="#">Explore the guides</ButtonLink>
              <ButtonLink href="#" variant="accent">
                Get in touch about buying
              </ButtonLink>
              <ButtonLink href="#" variant="outline">
                All areas
              </ButtonLink>
              <Button disabled>Disabled</Button>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3 rounded-sm bg-ocean-700 p-6">
              <ButtonLink href="#" variant="light">
                Light button on a dark background
              </ButtonLink>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Badge variant="featured">Featured</Badge>
              <Badge variant="placeholder">Placeholder</Badge>
              <Badge variant="category" className="ring-1 ring-line">
                Beach
              </Badge>
            </div>
          </Section>

          <Section title="Placeholder images">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <PlaceholderImage tone="lagoon" label="Lagoon" />
              <PlaceholderImage tone="sunset" label="Sunset" />
              <PlaceholderImage tone="sand" label="Beach" />
              <PlaceholderImage tone="ocean" label="Night" />
            </div>
          </Section>

          <Section title="Cards">
            <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              <Card
                href="#"
                eyebrow="Tamarin · Placeholder"
                title="Example beach"
                excerpt="Placeholder text. A short description of the place goes here."
                placeholder
              />
              <Card
                href="#"
                eyebrow="Black River · Placeholder"
                title="Example restaurant"
                excerpt="Placeholder text. Shows how a featured (paid) placement looks."
                placeholderTone="sunset"
                featured
                placeholder
              />
              <Card
                href="#"
                eyebrow="Le Morne · Placeholder"
                title="Example sunset spot"
                excerpt="Placeholder text. Cards have no borders or shadows, like a magazine."
                placeholderTone="sand"
                placeholder
              />
            </div>
          </Section>
        </Container>
      </main>

      <SiteFooter
        brandName={brandName.en}
        tagline="A guide to the west coast of Mauritius, from Flic en Flac to Le Morne. (Placeholder text.)"
        columns={[
          { title: "Explore", items: navItems.slice(0, 2) },
          { title: "Live here", items: navItems.slice(2, 3) },
          { title: "About", items: navItems.slice(3) },
        ]}
        legal="© West Mauritius"
      />
    </>
  );
}
