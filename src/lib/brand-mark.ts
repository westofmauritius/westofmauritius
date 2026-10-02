/**
 * The logo mark: the silhouette of the Rempart, the peak above Tamarin and
 * Black River seen in the start page photo, with the setting sun behind it
 * and a line of lagoon below. Drawn in a 24 x 24 box.
 *
 * One source for every place the mark appears: the header and footer
 * (Wordmark.tsx), the sharing images (scripts/og-template.tsx) and the app
 * icons (scripts/generate-icons.tsx; run it again after changing this file).
 */
export const brandMark = {
  viewBox: "0 0 24 24",
  /** Traced from the photo: long left slope, sharp tip leaning right, steep
   * right face and a small shoulder. */
  mountain:
    "M1 17.6 L4 15.4 L6.4 12.3 L8.5 8.8 L10.2 5.6 L11.3 3.3 L12.2 2.2 L13.1 2.7 L13.6 4.3 L13.9 7.1 L15.3 8.8 L17.5 10.8 L18.4 10.4 L19.7 12.4 L21.6 15 L23 17.6 Z",
  sun: { cx: 18.4, cy: 8.2, r: 3.9 },
  lagoon: { x: 5, y: 19.8, width: 14, height: 1.6, rx: 0.8 },
  colors: {
    sun: "#ec5a3c",
    ink: "#0f2a3d",
    lagoonOnLight: "#1fa39b",
    lagoonOnDark: "#79d6cf",
  },
} as const;
