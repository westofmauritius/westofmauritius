/**
 * Conversion tracking with Umami (cookie-free analytics, see the root layout).
 * Does nothing when Umami is not configured or is blocked by the visitor.
 */
type Umami = {
  track: (event: string, data?: Record<string, string | number>) => void;
};

export function track(event: string, data?: Record<string, string | number>) {
  try {
    (window as unknown as { umami?: Umami }).umami?.track(event, data);
  } catch {
    // Analytics must never break the page.
  }
}
