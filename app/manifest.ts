import type { MetadataRoute } from "next";

// ponytail: Next's native manifest route — no next-pwa, no build plugin, no
// hand-written public/manifest.json to keep in sync with the metadata in
// app/layout.tsx. Next serves this at /manifest.webmanifest and injects the
// <link rel="manifest"> itself, so there is nothing to wire into <head>.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ganyu Hub",
    short_name: "Ganyu Hub",
    description: "Hire Malawian designers, developers, and creatives.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    background_color: "#FFFFFF", // the page ground; cream was removed 2026-08-14
    theme_color: "#069494", // brand.DEFAULT — the teal token in tailwind.config.ts
    orientation: "portrait",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      // Separate maskable entry: Android crops "any" icons to a circle and would
      // clip the G. This one is the mark inset to the 80% safe zone on paper.
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Dashboard", url: "/dashboard" },
      { name: "Messages", url: "/messages" },
    ],
  };
}
