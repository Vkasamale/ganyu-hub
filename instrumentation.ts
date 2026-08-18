import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

/**
 * This one line is most of the value: it captures every unhandled server-side
 * request error — server actions, route handlers, RSC renders — without a
 * try/catch anywhere. The silently-failing payout webhook is the reason we
 * want it.
 */
export const onRequestError = Sentry.captureRequestError;
