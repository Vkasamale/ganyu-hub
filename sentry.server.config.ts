import * as Sentry from "@sentry/nextjs";

/**
 * Node runtime. Loaded by instrumentation.ts when NEXT_RUNTIME === "nodejs".
 *
 * No `dataCollection` block on purpose: passing the object at all — even `{}` —
 * flips every unset category to its permissive default. Omitting it keeps the
 * SDK on `sendDefaultPii: false`, which is the only acceptable setting here.
 * Server actions on this app carry private messages, briefs and MWK amounts,
 * and none of that belongs in an error report.
 */
// The Vercel<->Sentry integration provisions NEXT_PUBLIC_SENTRY_DSN only, so
// the server falls back to it. Same string either way — a DSN is public by
// design (it ships in the browser bundle), so reading the NEXT_PUBLIC_ one on
// the server leaks nothing. SENTRY_DSN still wins when set by hand.
const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn,
  // Unset DSN = the SDK no-ops. Deliberate: a clone with no Sentry env vars
  // should run normally, not crash on boot.
  enabled: Boolean(dsn),

  environment: process.env.VERCEL_ENV || process.env.NODE_ENV,
  // Vercel exposes the commit SHA. Without a release every issue is tagged
  // "unknown" and a regression can't be pinned to a deploy.
  release: process.env.VERCEL_GIT_COMMIT_SHA,

  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,

  // Local variables on stack frames are the difference between "payout failed"
  // and "payout failed for THIS ref". Server-only, never in the browser bundle.
  includeLocalVariables: true,
});
