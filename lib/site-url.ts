// Absolute site base for share links / OG. Deterministic (no request/window
// dependency) so it's identical on server and client — share anchors render
// correct hrefs in the SSR HTML and work even before/without hydration.
// On a preview deploy APP_URL still points at production, so sharing from
// sandbox handed people production links to jobs that only exist in sandbox.
// Prefer Vercel's own host when this isn't the production deploy. Only
// NEXT_PUBLIC_* vars may be read here: they're inlined at build time, so server
// and client agree. A server-only var would be undefined in the browser bundle
// and reintroduce the hydration mismatch this module exists to avoid.
// ponytail: needs "Automatically expose System Environment Variables" enabled
// in Vercel — without it these are undefined and we fall through to APP_URL.
const previewHost =
  process.env.NEXT_PUBLIC_VERCEL_ENV && process.env.NEXT_PUBLIC_VERCEL_ENV !== "production"
    ? process.env.NEXT_PUBLIC_VERCEL_BRANCH_URL || process.env.NEXT_PUBLIC_VERCEL_URL
    : null;

export const SITE_URL = (
  (previewHost ? `https://${previewHost}` : null) ||
  process.env.APP_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://ganyu-hub.vercel.app"
).replace(/\/$/, "");

export function absUrl(path: string) {
  return `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}
