import * as Sentry from "@sentry/nextjs";

/**
 * Edge runtime — this is what `proxy.ts` runs in, so an auth-redirect crash
 * lands here rather than in the Node config. Same PII stance as the server
 * config: no `dataCollection` block, so `sendDefaultPii` stays false.
 */
// Falls back to the NEXT_PUBLIC_ DSN for the same reason as the server config.
const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn,
  enabled: Boolean(dsn),

  environment: process.env.VERCEL_ENV || process.env.NODE_ENV,
  release: process.env.VERCEL_GIT_COMMIT_SHA,

  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
});
