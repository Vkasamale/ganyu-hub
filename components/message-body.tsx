import Link from "next/link";
import { JOB_MARKER_RE } from "@/lib/message-markers";
import { formatMwk } from "@/lib/utils";

export type EmbeddedJob = {
  id: string;
  title: string;
  status: string | null;
  budget_mwk: number | null;
};

export function MessageBody({
  body,
  jobs,
  mine,
}: {
  body: string | null | undefined;
  jobs: Map<string, EmbeddedJob>;
  mine: boolean;
}) {
  if (!body) return null;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;
  for (const m of body.matchAll(JOB_MARKER_RE)) {
    const start = m.index ?? 0;
    if (start > lastIndex) {
      parts.push(<span key={key++} className="whitespace-pre-wrap">{body.slice(lastIndex, start)}</span>);
    }
    const id = m[1].toLowerCase();
    const job = jobs.get(id);
    parts.push(<JobCard key={key++} id={id} job={job} mine={mine} />);
    lastIndex = start + m[0].length;
  }
  if (lastIndex < body.length) {
    parts.push(<span key={key++} className="whitespace-pre-wrap">{body.slice(lastIndex)}</span>);
  }
  return <>{parts}</>;
}

function JobCard({ id, job, mine }: { id: string; job: EmbeddedJob | undefined; mine: boolean }) {
  const cardCls = mine
    ? "mt-1.5 block rounded-lg border border-paper/25 bg-paper/10 px-3 py-2 text-left text-xs text-paper/95 hover:bg-paper/15"
    : "mt-1.5 block rounded-lg border border-ink/15 bg-white px-3 py-2 text-left text-xs text-ink hover:bg-ink/5";
  const labelCls = mine ? "text-[10px] uppercase tracking-wider text-paper/60" : "text-[10px] uppercase tracking-wider text-ink/55";
  const metaCls = mine ? "text-paper/70" : "text-ink/60";

  if (!job) {
    return (
      <Link href={`/jobs/${id}`} className={cardCls}>
        <p className={labelCls}>Job</p>
        <p className="mt-0.5 font-medium">Open job →</p>
      </Link>
    );
  }
  return (
    <Link href={`/jobs/${job.id}`} className={cardCls}>
      <p className={labelCls}>Job · {(job.status || "open").replace(/_/g, " ")}</p>
      <p className="mt-0.5 break-words font-medium">{job.title}</p>
      {job.budget_mwk != null && (
        <p className={`mt-0.5 ${metaCls}`}>Budget: {formatMwk(job.budget_mwk)}</p>
      )}
    </Link>
  );
}
