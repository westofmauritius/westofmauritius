import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Soley",
    short_name: "Soley",
    description: "Compare solar quotes from vetted installers in Mauritius.",
    start_url: "/",
    display: "standalone",
    background_color: "#fffbf3",
    theme_color: "#0a2e4a",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
