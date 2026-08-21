import Link from "next/link";
import { SaveButton } from "@/components/save-button";
import { DismissJob } from "@/components/dismiss-job";
import type { CardTrust } from "@/lib/client-trust";
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
  trust = null,
  dismissable = false,
}: {
  job: Job;
  saved?: boolean;
  showSave?: boolean;
  proposalsCount?: number;
  clientName?: string | null;
  /** Item 54: batched client trust. Null on surfaces that don't compute it. */
  trust?: CardTrust | null;
  /** Item 54: show the dismiss control (job lists only, not saved lists). */
  dismissable?: boolean;
}) {
  const tags = [job.category].filter(Boolean) as string[];
  const clientInitials = initialsOf(clientName);

  // Item 54 (§D). Whether the client has ever actually put money into escrow is
  // the most useful thing a creative can know before writing, so it leads. Each
  // signal is omitted rather than shown as a zero or an "unknown" (§Q7), and
  // none of them says "verified", because we verify nothing.
  const trustBits: string[] = [];
  if (trust?.hasFundedEscrow) trustBits.push("Has paid into escrow");
  if (trust?.hireRate != null) trustBits.push(`Hires ${Math.round(trust.hireRate * 100)}% of the time`);
  if (trust && trust.jobsPosted > 1) trustBits.push(`${trust.jobsPosted} jobs posted`);

  return (
    <div
      data-job-card={job.id}
      className="group relative overflow-hidden rounded-[14px] border border-ink/[0.08] bg-raised shadow-elev-1 transition-all duration-100 ease-out hover:-translate-y-0.5 hover:shadow-elev-2"
    >
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-1 origin-left scale-x-0 bg-stamp transition-transform duration-200 group-hover:scale-x-100"
      />

      <div className="p-5 md:p-6">
        {(showSave || dismissable) && (
          <div className="absolute right-4 top-4 flex items-center gap-1">
            {showSave && <SaveButton targetType="job" targetId={job.id} saved={saved} />}
            {dismissable && <DismissJob jobId={job.id} />}
          </div>
        )}

        <Link href={`/jobs/${job.id}`} className="block">
          <h3 className="pr-10 font-display text-xl font-semibold leading-tight text-ink md:text-2xl break-words">
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

        {trustBits.length > 0 && (
          <ul className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-ink/60">
            {trustBits.map((b, i) => (
              <li key={b} className="flex items-center gap-2">
                {i > 0 && <span aria-hidden className="text-ink/25">·</span>}
                <span>{b}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-mark/10 px-3 py-1.5 text-sm font-semibold text-mark">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 12V8H6a2 2 0 0 1 0-4h12v4" />
            <path d="M4 6v12a2 2 0 0 0 2 2h14v-4" />
            <path d="M18 12a2 2 0 0 0 0 4h4v-4z" />
          </svg>
          <span>Budget: {job.budget_mwk != null ? formatMwk(job.budget_mwk) : "Open"}</span>
        </div>

        <Link href={`/jobs/${job.id}`} className="group/desc mt-4 block">
          <p className="line-clamp-2 [overflow-wrap:anywhere] text-sm leading-relaxed text-ink/75">
            {job.brief || "No description provided."}
          </p>
          <p className="mt-1.5 text-xs font-medium text-stamp-dark underline-offset-4 group-hover/desc:underline">
            More info
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
