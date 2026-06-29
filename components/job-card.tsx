import Link from "next/link";
import { SaveButton } from "@/components/save-button";
import { formatMwk, timeAgo } from "@/lib/utils";
import type { Job } from "@/lib/types";

function initialsOf(name: string | null | undefined): string {
  return (name || "Client")
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function JobCard({
  job,
  saved = false,
  showSave = false,
  proposalsCount = 0,
  clientName = null,
}: {
  job: Job;
  saved?: boolean;
  showSave?: boolean;
  proposalsCount?: number;
  clientName?: string | null;
}) {
  const tags = [job.category].filter(Boolean) as string[];
  const clientInitials = initialsOf(clientName);

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-100 ease-out hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-1 origin-left scale-x-0 bg-stamp transition-transform duration-200 group-hover:scale-x-100"
      />

      <div className="p-5 md:p-6">
        {showSave && (
          <div className="absolute right-4 top-4">
            <SaveButton targetType="job" targetId={job.id} saved={saved} />
          </div>
        )}

        <Link href={`/jobs/${job.id}`} className="block">
          <h3 className="pr-10 font-display text-xl font-semibold leading-tight text-ink md:text-2xl">
            {job.title}
          </h3>
        </Link>

        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-ink/55">
          <span>{timeAgo(job.created_at)}</span>
          <span aria-hidden>·</span>
          <span className="rounded-full bg-wash/70 px-2.5 py-0.5 font-medium text-ink/75">{job.category}</span>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-ink/85 text-[10px] font-semibold text-paper">
            {clientInitials}
          </div>
          <p className="text-xs text-ink/65">
            Posted by <span className="font-medium text-ink/80">{clientName || "a client"}</span>
          </p>
        </div>

        <div className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-mark/10 px-3 py-1.5 text-sm font-semibold text-mark">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
          <span>Budget: {job.budget_mwk != null ? formatMwk(job.budget_mwk) : "Open"}</span>
        </div>

        <Link href={`/jobs/${job.id}`} className="mt-4 block">
          <p className="line-clamp-3 text-sm leading-relaxed text-ink/75">
            {job.brief || "No description provided."}
          </p>
        </Link>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-ink/10 pt-4">
          <div className="flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <span key={t} className="rounded-full bg-ink/5 px-2.5 py-0.5 text-[10px] font-medium text-ink/70">
                {t}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-ink/60">
              <span className="font-semibold text-ink/80">{proposalsCount}</span> {proposalsCount === 1 ? "proposal" : "proposals"}
            </span>
            <Link
              href={`/jobs/${job.id}`}
              className="rounded-md bg-ink px-3 py-1.5 text-xs font-medium text-paper transition-colors hover:bg-stamp"
            >
              See more
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
