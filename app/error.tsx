"use client";
import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <p className="font-serif text-6xl italic text-ink/30">oops</p>
      <h1 className="mt-4 text-2xl font-semibold">Something went sideways.</h1>
      <p className="mt-2 text-sm text-neutral-600">
        We hit an unexpected error. Try again — if it keeps happening, drop us a note.
      </p>
      <Button onClick={reset} className="mt-6">Try again</Button>
    </div>
  );
}
