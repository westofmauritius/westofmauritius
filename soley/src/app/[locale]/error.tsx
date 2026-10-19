"use client";

import { useTranslations } from "next-intl";
import { Button, Container } from "@/components/ui";

export default function ErrorPage({ reset }: { reset: () => void }) {
  const t = useTranslations("error");
  return (
    <Container narrow className="py-20">
      <h1 className="text-4xl">{t("title")}</h1>
      <p className="mt-4 text-lg text-ink-muted">{t("body")}</p>
      <Button className="mt-8" onClick={reset}>
        {t("retry")}
      </Button>
    </Container>
  );
}
