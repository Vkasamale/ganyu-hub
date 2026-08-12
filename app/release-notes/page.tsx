import type { Metadata } from "next";
import { RELEASES, VERSION } from "@/lib/whats-new";

// The footer links here (audit §J3 #6 — "the What's New panel already exists
// behind the version badge; give it a real link"). Same RELEASES constant, no
// second source of truth.
export const metadata: Metadata = {
  title: "Release notes — Ganyu Hub",
  description: "What has changed on Ganyu Hub, version by version.",
};

export default function ReleaseNotesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-8 md:py-16">
      <p className="eyebrow text-ink/55">Currently v{VERSION}</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink md:text-4xl">
        Release notes
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-ink/65">
        Ganyu Hub is in beta and changes often. Everything shipped so far, newest first.
      </p>

      <ol className="mt-10 space-y-8">
        {RELEASES.map((r) => (
          <li key={r.version} className="border-t border-ink/15 pt-5">
            <div className="flex flex-wrap items-baseline gap-3">
              <h2 className="font-mono text-sm tracking-[0.14em] text-brand">v{r.version}</h2>
              <span className="text-xs text-ink/50">{r.date}</span>
            </div>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-ink/70">
              {r.notes.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
}
