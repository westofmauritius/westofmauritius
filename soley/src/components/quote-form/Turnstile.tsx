"use client";

import { useEffect, useRef } from "react";
import { site } from "@/lib/site";

declare global {
  interface Window {
    turnstile?: {
      render: (
        element: HTMLElement,
        options: Record<string, unknown>,
      ) => string;
      remove: (id: string) => void;
    };
  }
}

const SCRIPT_ID = "cf-turnstile-script";

/**
 * Cloudflare Turnstile bot protection. It adds a hidden
 * "cf-turnstile-response" field to the surrounding form, which the server
 * action checks. Renders nothing when no site key is configured.
 */
export function Turnstile({
  label,
  language,
}: {
  label: string;
  language: string;
}) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!site.turnstileSiteKey || !container.current) return;
    let widgetId: string | undefined;
    const render = () => {
      if (!window.turnstile || !container.current || widgetId) return;
      widgetId = window.turnstile.render(container.current, {
        sitekey: site.turnstileSiteKey,
        language,
        appearance: "interaction-only",
      });
    };
    if (window.turnstile) render();
    else if (!document.getElementById(SCRIPT_ID)) {
      const script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.src =
        "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.onload = render;
      document.head.appendChild(script);
    } else {
      document.getElementById(SCRIPT_ID)?.addEventListener("load", render);
    }
    return () => {
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
    };
  }, [language]);

  if (!site.turnstileSiteKey) return null;
  return <div ref={container} aria-label={label} className="min-h-0" />;
}
