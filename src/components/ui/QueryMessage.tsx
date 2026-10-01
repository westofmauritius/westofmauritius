"use client";

import { useSyncExternalStore } from "react";

/**
 * Shows one of several prerendered messages depending on a URL parameter,
 * e.g. /thank-you?form=contact. The page itself stays static.
 */
export function QueryMessage({
  param,
  messages,
  fallback,
}: {
  param: string;
  messages: Record<string, string>;
  fallback: string;
}) {
  const value = useSyncExternalStore(
    () => () => {},
    () => new URLSearchParams(window.location.search).get(param) ?? "",
    () => "",
  );
  return <>{messages[value] ?? fallback}</>;
}
