// Absolute site base for share links / OG. Deterministic (no request/window
// dependency) so it's identical on server and client — share anchors render
// correct hrefs in the SSR HTML and work even before/without hydration.
export const SITE_URL = (
  process.env.APP_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://ganyu-hub.vercel.app"
).replace(/\/$/, "");

export function absUrl(path: string) {
  return `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}
