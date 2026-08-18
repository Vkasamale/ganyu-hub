"use client";
import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import NextError from "next/error";

/**
 * The last boundary: this catches errors thrown by the root layout itself,
 * which `app/error.tsx` cannot — that one lives *inside* the layout. It
 * replaces the whole document, so it renders its own <html>/<body> and cannot
 * use Navbar, Footer or globals.css. Next's bare error page is the right call
 * here; a branded screen would need the layout that just failed.
 */
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <NextError statusCode={0} />
      </body>
    </html>
  );
}
