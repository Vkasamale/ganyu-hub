import { Card, CardContent } from "@/components/ui/card";
import { Collapsible } from "@/components/collapsible";
import { timeAgo } from "@/lib/utils";
import type { JobEventType } from "@/lib/job-events";

export type JobEventRow = {
  id: string;
  event_type: string;
  note: string | null;
  created_at: string;
  metadata?: Record<string, unknown> | null;
};

const LABELS: Record<JobEventType, string> = {
  proposal_accepted: "Proposal accepted",
  escrow_funded: "Payment landed in escrow",
  work_started: "Work started",
  files_delivered: "Files delivered",
  revision_requested: "Revision requested",
  revision_delivered: "Revision delivered",
  job_completed: "Job completed",
  dispute_filed: "Dispute filed",
  dispute_resolved: "Dispute resolved",
  cancelled: "Job cancelled",
  deadline_extended: "Deadline extended",
  payment_released: "Payment released to creative",
};

// Inline SVGs match the codebase pattern (image-picker.tsx, etc). Kept plain
// so the timeline stays visually quiet — this sits next to the status badge,
// not replacing it.
function EventIcon({ type }: { type: string }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "h-3.5 w-3.5",
  };
  switch (type) {
    case "proposal_accepted":
    case "job_completed":
    case "revision_delivered":
      return <svg {...common}><polyline points="20 6 9 17 4 12" /></svg>;
    case "escrow_funded":
    case "payment_released":
      return <svg {...common}><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>;
    case "work_started":
      return <svg {...common}><polygon points="5 3 19 12 5 21 5 3" /></svg>;
    case "files_delivered":
      return <svg {...common}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>;
    case "revision_requested":
      return <svg {...common}><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 102.13-9.36L1 10" /></svg>;
    case "dispute_filed":
    case "dispute_resolved":
      return <svg {...common}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>;
    case "cancelled":
      return <svg {...common}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
    case "deadline_extended":
      return <svg {...common}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
    default:
      return <svg {...common}><circle cx="12" cy="12" r="3" /></svg>;
  }
}

// Delivery attachments live in event.metadata. Uploaded files store the
// storage path in `file_url` and the page mints a signed URL keyed by path;
// external links store the raw URL in `external_link`.
function DeliveryAttachment({
  metadata,
  signedUrls,
}: {
  metadata: Record<string, unknown> | null | undefined;
  signedUrls: Record<string, string>;
}) {
  if (!metadata) return null;
  const external = typeof metadata.external_link === "string" ? metadata.external_link : null;
  const filePath = typeof metadata.file_url === "string" ? metadata.file_url : null;
  const fileName = typeof metadata.file_name === "string" ? metadata.file_name : "download";

  if (external) {
    return (
      <p className="mt-1 text-xs">
        <a
          href={external}
          target="_blank"
          rel="noopener noreferrer"
          className="text-ink underline underline-offset-2 hover:text-ink/80"
        >
          {external.length > 60 ? external.slice(0, 57) + "…" : external}
        </a>
        <span className="ml-1 text-ink/50">— External link (opens in new tab)</span>
      </p>
    );
  }
  if (filePath) {
    const signed = signedUrls[filePath];
    if (!signed) {
      return <p className="mt-1 text-xs text-ink/50">{fileName} — link expired, refresh to regenerate</p>;
    }
    return (
      <p className="mt-1 text-xs">
        <a
          href={signed}
          target="_blank"
          rel="noopener noreferrer"
          className="text-ink underline underline-offset-2 hover:text-ink/80"
        >
          Download: {fileName}
        </a>
      </p>
    );
  }
  return null;
}

export function JobTimeline({
  events,
  signedUrls = {},
  revisionsIncluded,
  revisionsUsed,
}: {
  events: JobEventRow[];
  signedUrls?: Record<string, string>;
  revisionsIncluded?: number | null;
  revisionsUsed?: number | null;
}) {
  if (!events || events.length === 0) return null;

  // Sorted oldest→newest for a natural reading order.
  const ordered = [...events].sort((a, b) => a.created_at.localeCompare(b.created_at));
  const hasRevisions = revisionsIncluded != null && revisionsIncluded > 0;
  // Collapsed, the timeline is one line: where the job is right now. The full
  // history is a click away rather than a scroll.
  const latest = ordered[ordered.length - 1];
  const currentStage = `${LABELS[latest.event_type as JobEventType] ?? latest.event_type} · ${timeAgo(latest.created_at)}`;

  return (
    <Card className="mt-6">
      <CardContent className="p-5">
        <Collapsible
          title="Activity"
          summary={currentStage}
          right={
            hasRevisions ? (
              <span className="shrink-0 text-xs text-ink/60">
                Revisions: <strong>{revisionsUsed ?? 0}</strong> of {revisionsIncluded} used
              </span>
            ) : undefined
          }
        >
        <ol className="space-y-4">
          {ordered.map((e, i) => {
            const label = LABELS[e.event_type as JobEventType] ?? e.event_type;
            const isLast = i === ordered.length - 1;
            return (
              <li key={e.id} className="relative flex gap-3 pl-1">
                <div className="relative flex flex-col items-center">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border border-ink/20 bg-paper text-ink/70">
                    <EventIcon type={e.event_type} />
                  </span>
                  {!isLast && <span className="mt-1 h-6 w-px bg-ink/15" aria-hidden />}
                </div>
                <div className="pt-0.5">
                  <p className="text-sm text-ink">{label}</p>
                  {e.note && <p className="mt-0.5 text-xs text-ink/60">{e.note}</p>}
                  <DeliveryAttachment metadata={e.metadata} signedUrls={signedUrls} />
                  <p className="mt-0.5 text-xs text-ink/50">{timeAgo(e.created_at)}</p>
                </div>
              </li>
            );
          })}
        </ol>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
