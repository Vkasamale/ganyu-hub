import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatMwk, timeAgo } from "@/lib/utils";

const STATUS_LABELS: Record<string, string> = {
  open: "Open",
  in_progress: "In progress",
  submitted: "Submitted",
  revision_requested: "Revision requested",
  completed: "Completed",
  disputed: "Disputed",
  cancelled: "Cancelled",
};

function StatusBadge({ status }: { status?: string }) {
  return <Badge className="bg-white">{STATUS_LABELS[status || "open"] || status}</Badge>;
}

export default async function DashboardJobsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: posted } = await supabase
    .from("jobs")
    .select("id, title, category, budget_mwk, status, created_at, proposals(count)")
    .eq("client_id", user.id)
    .order("created_at", { ascending: false });

  const { data: engagements } = await supabase
    .from("proposals")
    .select("id, bid_mwk, status, created_at, job:jobs(id, title, category, status, created_at)")
    .eq("creative_id", user.id)
    .order("created_at", { ascending: false });

  const CLOSED = new Set(["completed", "cancelled"]);
  const postedActive = (posted || []).filter((j: any) => !CLOSED.has(j.status));
  const postedClosed = (posted || []).filter((j: any) => CLOSED.has(j.status));
  const active = (engagements || []).filter((e: any) => e.status === "accepted" && !CLOSED.has(e.job?.status));
  const completed = (engagements || []).filter((e: any) => e.status === "accepted" && CLOSED.has(e.job?.status));
  const otherProposals = (engagements || []).filter((e: any) => e.status !== "accepted");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-10">
      <div>
        <h1 className="text-2xl font-bold">Jobs</h1>
        <p className="mt-1 text-sm text-neutral-500">Track every job you posted or are working on.</p>
      </div>

      {(postedActive.length > 0 || active.length > 0) && (
        <section>
          <h2 className="text-xl font-semibold">Active jobs</h2>
          <p className="mt-1 text-sm text-neutral-500">In progress, awaiting work, or open for proposals.</p>
          <div className="mt-4 space-y-3">
            {postedActive.map((j: any) => (
              <Link key={`p-${j.id}`} href={`/jobs/${j.id}`}>
                <Card className="transition hover:border-brand">
                  <CardContent className="flex items-center justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{j.title}</p>
                      <p className="text-xs text-neutral-500">
                        Posted &middot; {j.category} &middot; {formatMwk(j.budget_mwk)} &middot; {timeAgo(j.created_at)} &middot; {j.proposals?.[0]?.count || 0} proposals
                      </p>
                    </div>
                    <StatusBadge status={j.status} />
                  </CardContent>
                </Card>
              </Link>
            ))}
            {active.map((e: any) => (
              <Link key={`e-${e.id}`} href={`/jobs/${e.job?.id}`}>
                <Card className="transition hover:border-brand">
                  <CardContent className="flex items-center justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{e.job?.title}</p>
                      <p className="text-xs text-neutral-500">
                        Working on &middot; {e.job?.category} &middot; bid {formatMwk(e.bid_mwk)} &middot; {timeAgo(e.created_at)}
                      </p>
                    </div>
                    <StatusBadge status={e.job?.status} />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {(postedClosed.length > 0 || completed.length > 0) && (
        <section>
          <h2 className="text-xl font-semibold">Completed jobs</h2>
          <p className="mt-1 text-sm text-neutral-500">Finished or cancelled.</p>
          <div className="mt-4 space-y-3">
            {postedClosed.map((j: any) => (
              <Link key={`pc-${j.id}`} href={`/jobs/${j.id}`}>
                <Card className="transition hover:border-brand">
                  <CardContent className="flex items-center justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{j.title}</p>
                      <p className="text-xs text-neutral-500">
                        Posted &middot; {j.category} &middot; {formatMwk(j.budget_mwk)} &middot; {timeAgo(j.created_at)}
                      </p>
                    </div>
                    <StatusBadge status={j.status} />
                  </CardContent>
                </Card>
              </Link>
            ))}
            {completed.map((e: any) => (
              <Link key={`ec-${e.id}`} href={`/jobs/${e.job?.id}`}>
                <Card className="transition hover:border-brand">
                  <CardContent className="flex items-center justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{e.job?.title}</p>
                      <p className="text-xs text-neutral-500">
                        Worked on &middot; {e.job?.category} &middot; bid {formatMwk(e.bid_mwk)} &middot; {timeAgo(e.created_at)}
                      </p>
                    </div>
                    <StatusBadge status={e.job?.status} />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {otherProposals.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold">Your other proposals</h2>
          <div className="mt-4 space-y-3">
            {otherProposals.map((e: any) => (
              <Link key={e.id} href={`/jobs/${e.job?.id}`}>
                <Card className="transition hover:border-brand">
                  <CardContent className="flex items-center justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{e.job?.title}</p>
                      <p className="text-xs text-neutral-500">
                        bid {formatMwk(e.bid_mwk)} &middot; proposal {e.status} &middot; {timeAgo(e.created_at)}
                      </p>
                    </div>
                    <StatusBadge status={e.job?.status} />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {(!posted || posted.length === 0) && active.length === 0 && completed.length === 0 && otherProposals.length === 0 && (
        <p className="text-neutral-500">No jobs yet. <Link href="/jobs/new" className="text-brand hover:underline">Post one</Link> or <Link href="/jobs" className="text-brand hover:underline">browse jobs</Link>.</p>
      )}
    </div>
  );
}
