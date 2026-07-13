"use client";

import { useRef } from "react";

type Job = { id: string; title: string };

export function MessageJobPicker({ jobs }: { jobs: Job[] }) {
  const ref = useRef<HTMLDetailsElement>(null);

  if (jobs.length === 0) return null;

  const attach = (id: string) => {
    const input = document.querySelector<HTMLInputElement>('input[name="body"]');
    if (!input) return;
    const marker = `[[job:${id}]]`;
    const current = input.value || "";
    input.value = current ? `${current.trimEnd()} ${marker}` : marker;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.focus();
    if (ref.current) ref.current.open = false;
  };

  return (
    <details ref={ref} className="relative">
      <summary
        className="inline-flex h-9 cursor-pointer list-none items-center gap-1.5 rounded-md border border-ink/15 bg-white px-3 text-sm text-ink/75 hover:bg-ink/5 [&::-webkit-details-marker]:hidden"
        aria-label="Attach a job"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
          <path d="M20 12V8H6a2 2 0 0 1 0-4h12v4" />
          <path d="M4 6v12a2 2 0 0 0 2 2h14v-4" />
        </svg>
        Job
      </summary>
      <div className="absolute bottom-full left-0 z-20 mb-2 max-h-72 w-72 overflow-y-auto rounded-lg border border-ink/15 bg-white p-1 shadow-lg">
        {jobs.map((j) => (
          <button
            key={j.id}
            type="button"
            onClick={() => attach(j.id)}
            className="block w-full rounded px-3 py-2 text-left text-sm text-ink hover:bg-ink/5"
          >
            <span className="line-clamp-2 break-words">{j.title}</span>
          </button>
        ))}
      </div>
    </details>
  );
}
