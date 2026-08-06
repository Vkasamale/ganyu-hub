"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { markMilestone } from "@/app/actions";

export type ChecklistStep = { label: string; sub?: string; href: string; done?: boolean };

// Dismissible "Get started" card for the dashboard. Steps tick off as the user
// completes them (done computed server-side); an explicit ✕ dismisses it for
// good.
//
// Dismissal lives on the PROFILE, not localStorage: "show it once" has to mean
// once per user, not once per browser, or it reappears every time they sign in
// on a new device.
export function WelcomeChecklist({
  steps,
  dismissed,
}: {
  steps: ChecklistStep[];
  dismissed: boolean;
}) {
  const [hidden, setHidden] = useState(dismissed);
  const [, startTransition] = useTransition();

  if (hidden) return null;

  const doneCount = steps.filter((s) => s.done).length;

  function dismiss() {
    setHidden(true); // optimistic — the write is fire-and-forget
    startTransition(() => {
      void markMilestone("welcome");
    });
  }

  return (
    <div className="mb-6 rounded-2xl border border-stamp/25 bg-stamp/[0.04] p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-semibold text-ink">Welcome to Ganyu Hub 👋</p>
          <p className="mt-0.5 text-sm text-ink/60">
            {doneCount === steps.length
              ? "You're all set — nice one."
              : `A couple of quick things to get going (${doneCount}/${steps.length} done).`}
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded-md px-2 py-1 text-xs text-ink/50 hover:bg-ink/5 hover:text-ink/80"
        >
          Dismiss
        </button>
      </div>

      <ol className="mt-4 space-y-2">
        {steps.map((s) => (
          <li key={s.label}>
            <Link
              href={s.href}
              className="flex items-center gap-3 rounded-xl border border-ink/10 bg-white p-3 transition hover:-translate-y-0.5 hover:border-ink/20"
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  s.done ? "bg-stamp text-paper" : "border border-ink/25 text-ink/40"
                }`}
                aria-hidden
              >
                {s.done ? "✓" : ""}
              </span>
              <span className="min-w-0">
                <span className={`block text-sm font-medium ${s.done ? "text-ink/50 line-through" : "text-ink"}`}>
                  {s.label}
                </span>
                {s.sub && <span className="block text-xs text-ink/55">{s.sub}</span>}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
