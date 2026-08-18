import * as Sentry from "@sentry/nextjs";

/**
 * Browser runtime. Next loads this file itself — it is not imported anywhere.
 *
 * Session Replay is deliberately NOT enabled here. It is the SDK's headline
 * recommendation for user-facing apps, but this app's user-facing surfaces are
 * private messages, briefs and money, and replay's masking is a default to be
 * audited rather than trusted on sight. Worth adding on purpose, not in
 * passing — see the note left in BACKLOG.md.
 */
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),

  environment: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV,
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,

  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
});

// App Router navigation spans. Without this a client-side route change is
// invisible and every trace looks like a cold page load.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
