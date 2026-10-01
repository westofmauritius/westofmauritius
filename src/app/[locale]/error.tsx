"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

// Error pages render in the browser without the server's translations, so
// their few words live here.
const texts = {
  en: {
    title: "Something went wrong",
    body: "Sorry, this page could not be shown. Please try again in a moment.",
    retry: "Try again",
    home: "Back to the start page",
  },
  fr: {
    title: "Un problème est survenu",
    body: "Désolé, cette page n’a pas pu s’afficher. Merci de réessayer dans un instant.",
    retry: "Réessayer",
    home: "Retour à l’accueil",
  },
};

/** Shown when a page fails while rendering; header and footer stay in place. */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { locale } = useParams<{ locale: string }>();
  const t = texts[locale === "fr" ? "fr" : "en"];

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container className="py-24">
      <p className="mb-4 eyebrow text-coral-600">Error</p>
      <h1 className="text-display-2">{t.title}</h1>
      <p className="mt-6 max-w-xl text-lg text-ink-muted">{t.body}</p>
      <div className="mt-10 flex flex-wrap gap-3">
        <Button onClick={reset}>{t.retry}</Button>
        {/* A full page load, in case the app itself is in a broken state. */}
        <a
          href={`/${locale === "fr" ? "fr" : "en"}`}
          className="inline-flex min-h-11 items-center rounded-full border border-ocean-900/25 px-6 text-sm font-medium"
        >
          {t.home}
        </a>
      </div>
    </Container>
  );
}
