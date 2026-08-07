"use client";

import { useRef, useState } from "react";

type Job = { id: string; title: string };

// Picking a job used to paste `[[job:<uuid>]]` straight into the message box, so
// the composer showed a raw code the user wasn't meant to edit — and being plain
// text, it could be half-deleted and sent broken. The marker still goes out in
// the body (MessageBody renders it as a card), but it's carried in a hidden
// field now and shown as a removable chip with the job's actual title.
export function MessageJobPicker({ jobs }: { jobs: Job[] }) {
  const ref = useRef<HTMLDetailsElement>(null);
  const [picked, setPicked] = useState<Job | null>(null);

  if (jobs.length === 0) return null;

  return (
    <>
      {/* SavingForm resets on success, which clears this along with the input. */}
      <input type="hidden" name="attached_job_id" value={picked?.id ?? ""} />

      {picked ? (
        <span className="inline-flex h-9 max-w-[14rem] items-center gap-1.5 rounded-md border border-ink/15 bg-wash/60 px-2.5 text-sm text-ink/80">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0">
            <path d="M20 12V8H6a2 2 0 0 1 0-4h12v4" />
            <path d="M4 6v12a2 2 0 0 0 2 2h14v-4" />
          </svg>
          <span className="truncate">{picked.title}</span>
          <button
            type="button"
            onClick={() => setPicked(null)}
            aria-label={`Remove attached job ${picked.title}`}
            className="shrink-0 rounded p-0.5 text-ink/50 hover:bg-ink/10 hover:text-ink"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </span>
      ) : (
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
                onClick={() => {
                  setPicked(j);
                  if (ref.current) ref.current.open = false;
                }}
                className="block w-full rounded px-3 py-2 text-left text-sm text-ink hover:bg-ink/5"
              >
                <span className="line-clamp-2 break-words">{j.title}</span>
              </button>
            ))}
          </div>
        </details>
      )}
    </>
  );
}
