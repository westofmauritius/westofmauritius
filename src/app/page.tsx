import { ButtonLink } from "@/components/ui/Button";
import { Wordmark } from "@/components/ui/Wordmark";
import { areaNames, brandName } from "@/lib/site";

// Temporary start page. Replaced by the real, language-aware start page in step 7.
export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 bg-sand-50 px-4 text-center">
      <p className="eyebrow text-ink-muted">Coming soon</p>
      <Wordmark name={brandName.en} className="text-4xl sm:text-5xl" />
      <p className="max-w-md text-ink-muted">{areaNames.join(" · ")}</p>
      <ButtonLink href="/styleguide" variant="outline">
        View the style guide
      </ButtonLink>
    </main>
  );
}
