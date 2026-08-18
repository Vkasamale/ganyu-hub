import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  experimental: {
    serverActions: { bodySizeLimit: "50mb" },
  },
};
// `org` and `project` are read from SENTRY_ORG / SENTRY_PROJECT rather than
// hardcoded, so nothing here has to change when the Sentry project is created.
// Source maps only upload when SENTRY_AUTH_TOKEN is present (a build-time
// secret, NOT the DSN) — without it the build still succeeds, it just ships
// minified stack traces.
export default withSentryConfig(nextConfig, {
  authToken: process.env.SENTRY_AUTH_TOKEN,
  // Better client stack traces.
  widenClientFileUpload: true,
  // Routes browser events through our own origin. Without it every client-side
  // error from a uBlock/Brave user is silently dropped — which is a large share
  // of them. Requires the /monitoring exclusion in proxy.ts.
  tunnelRoute: "/monitoring",
  silent: !process.env.CI,
});
