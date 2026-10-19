"use client";

import { useEffect } from "react";
import { DRAFT_KEY } from "@/components/quote-form/QuoteForm";

/** The request was sent, so the saved draft is no longer needed. */
export function ClearDraft() {
  useEffect(() => {
    try {
      window.localStorage.removeItem(DRAFT_KEY);
    } catch {}
  }, []);
  return null;
}
