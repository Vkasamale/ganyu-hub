import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatMwk, timeAgo } from "@/lib/utils";

type Tab = "sent" | "received";

const STATUS_PILL: Record<string, string> = {
  accepted: "bg-mark/10 text-mark",
  pending: "bg-ink/10 text-ink/70",
  declined: "bg-stamp/10 text-stamp",
  withdrawn: "bg-ink/10 text-ink/50",
};

function statusClass(status: string) {
  return STATUS_PILL[status] || "bg-ink/10 text-ink/70";
}

export default async function ProposalsPage({ searchParams }: { searchParams?: { tab?: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: sent } = await supabase
    .from("proposals")
    .select("*, job:jobs(id, title, category)")
    .eq("creative_id", user.id)
    .order("created_at", { ascending: false });

  const { data: received } = await supabase
    .from("proposals")
    .select("*, job:jobs!inner(id, title, client_id), creative:profiles!proposals_creative_id_fkey(id, full_name)")
    .eq("job.client_id", user.id)
    .order("created_at", { ascending: false });

  const tab: Tab = searchParams?.tab === "received" ? "received" : "sent";
  const sentCount = sent?.length || 0;
  const receivedCount = received?.length || 0;

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow">Pipeline</p>
        <h1 className="mt-1 text-3xl font-display font-semibold text-ink">Proposals</h1>
        <p className="mt-1 text-sm text-ink/60">Bids you&apos;ve put out and bids waiting on your call.</p>
      </header>

      <section className="card-soft p-6">
        <nav className="flex gap-1 border-b border-ink/10 pb-3">
          <Link
            href="/dashboard/proposals?tab=sent"
            scroll={false}
            className={
              tab === "sent"
                ? "rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper"
                : "rounded-md px-4 py-2 text-sm text-ink/70 transition-colors hover:bg-wash/60 hover:text-ink"
            }
          >
            Sent <span className="ml-1 text-xs opacity-70">{sentCount}</span>
          </Link>
          <Link
            href="/dashboard/proposals?tab=received"
            scroll={false}
            className={
              tab === "received"
                ? "rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper"
                : "rounded-md px-4 py-2 text-sm text-ink/70 transition-colors hover:bg-wash/60 hover:text-ink"
            }
          >
            Received <span className="ml-1 text-xs opacity-70">{receivedCount}</span>
          </Link>
        </nav>

        <div className="mt-5 space-y-3">
          {tab === "sent" ? (
            sentCount === 0 ? (
              <p className="rounded-lg border border-dashed border-ink/20 p-6 text-center text-sm text-ink/55">No proposals sent yet.</p>
            ) : (
              (sent || []).map((p: any) => (
                <Link
                  key={p.id}
                  href={`/jobs/${p.job?.id}`}
                  className="card-soft flex items-center justify-between p-4 transition hover:-translate-y-0.5"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink">{p.job?.title}</p>
                    <p className="mt-0.5 text-xs text-ink/60">{timeAgo(p.created_at)} · {formatMwk(p.bid_mwk)}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${statusClass(p.status)}`}>
                    {p.status}
                  </span>
                </Link>
              ))
            )
          ) : receivedCount === 0 ? (
            <p className="rounded-lg border border-dashed border-ink/20 p-6 text-center text-sm text-ink/55">No proposals received yet.</p>
          ) : (
            (received || []).map((p: any) => (
              <Link
                key={p.id}
                href={`/jobs/${p.job?.id}`}
                className="card-soft flex items-center justify-between p-4 transition hover:-translate-y-0.5"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">{p.job?.title}</p>
                  <p className="mt-0.5 text-xs text-ink/60">from {p.creative?.full_name || "Unnamed"} · {formatMwk(p.bid_mwk)}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${statusClass(p.status)}`}>
                  {p.status}
                </span>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
