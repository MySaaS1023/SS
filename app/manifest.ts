import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Steady Start LLC",
    short_name: "Steady Start",
    start_url: "/",
    display: "browser",
    background_color: "#F5F9FC",
    theme_color: "#061B35",
    icons: [
      { src: "/brand/steady-start-icon-192-v2.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/brand/steady-start-icon-512-v2.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
