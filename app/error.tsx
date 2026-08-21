"use client";
import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { Button } from "@/components/ui/button";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  // `onRequestError` in instrumentation.ts covers server-side throws, but an
  // error caught by this boundary is otherwise swallowed — the user sees "oops"
  // and we see nothing. Every route's render errors route through here, so
  // reporting once at the boundary covers all of them.
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <p className="text-6xl text-ink/30">oops</p>
      <h1 className="mt-4 text-2xl font-semibold">Something went sideways.</h1>
      <p className="mt-2 text-sm text-neutral-600">
        We hit an unexpected error. Try again — if it keeps happening, drop us a note.
      </p>
      <Button onClick={reset} className="mt-6">Try again</Button>
    </div>
  );
}
