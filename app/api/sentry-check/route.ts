import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";

export const runtime = "nodejs";

/**
 * Throws on purpose, to prove Sentry is receiving server errors.
 *
 * Sentry's own suggestion is a public `/sentry-example-page`. That is a
 * stranger-triggerable error generator on a production site, so this is gated
 * on CRON_SECRET instead — the same secret and the same constant-time compare
 * as app/api/cron/non-response-check/route.ts. Without the header it is a plain
 * 401 and reveals nothing.
 *
 * The thrown error is deliberately NOT caught: instrumentation.ts's
 * `onRequestError` is the thing under test, so catching it here would test
 * nothing.
 */
function bearerOk(header: string): boolean {
  const expected = `Bearer ${process.env.CRON_SECRET}`;
  const a = Buffer.from(header);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(req: Request) {
  const auth = req.headers.get("authorization") || "";
  if (!process.env.CRON_SECRET || !bearerOk(auth)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  throw new Error("Sentry verification error — server route, thrown on purpose");
}
