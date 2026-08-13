"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

const KEY = "gh_dismissed_jobs";

function dismissed(): string[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

/**
 * Item 54 (§D) — "not for me" on a job card.
 *
 * ponytail: localStorage, not a table. `interaction_kind` is a Postgres enum,
 * so a stored dismiss means a migration — for a preference whose whole job is
 * tidying one person's list on one device. If dismissals ever need to follow a
 * user between phone and laptop, that migration is the upgrade path.
 *
 * Ceiling: a dismissed card is rendered by the server and hidden on mount, so
 * it can flash briefly on a slow device. The alternative is making every job
 * list a client component, which costs more than the flash does.
 *
 * Each button hides its OWN card — no coordinator, no context, no store.
 */
export function DismissJob({ jobId }: { jobId: string }) {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (dismissed().includes(jobId)) {
      ref.current?.closest("[data-job-card]")?.setAttribute("hidden", "");
    }
  }, [jobId]);

  function hide() {
    const next = Array.from(new Set([...dismissed(), jobId]));
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // Private mode or a full quota: hiding it for this view is still better
      // than doing nothing, so carry on rather than throwing.
    }
    ref.current?.closest("[data-job-card]")?.setAttribute("hidden", "");
  }

  return (
    <button
      ref={ref}
      type="button"
      onClick={hide}
      aria-label="Hide this job"
      title="Not for me — hide this job"
      className="rounded-full p-1.5 text-ink/35 transition-colors hover:bg-ink/5 hover:text-ink/70"
    >
      <X className="h-4 w-4" />
    </button>
  );
}
