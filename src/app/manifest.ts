import type { MetadataRoute } from "next";

/** Web app manifest: name, colours and icons when the site is saved to a home screen. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "West Mauritius",
    short_name: "West Mauritius",
    description:
      "Restaurants, beaches, sunsets and living on the west coast of Mauritius.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0f2a3d",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
