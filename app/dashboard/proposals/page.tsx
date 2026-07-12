import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PeriodBarChart, TwoSeriesBarChart } from "@/components/admin-charts";
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

function startOfWeek(d: Date): number {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - x.getDay());
  return x.getTime();
}

function weeklyBuckets(rows: { created_at: string }[], weeks = 8) {
  const now = startOfWeek(new Date());
  const week = 7 * 24 * 60 * 60 * 1000;
  const buckets = Array.from({ length: weeks }, (_, i) => ({
    ts: now - (weeks - 1 - i) * week,
    count: 0,
  }));
  rows.forEach((r) => {
    const w = startOfWeek(new Date(r.created_at));
    const idx = buckets.findIndex((b) => b.ts === w);
    if (idx >= 0) buckets[idx].count++;
  });
  return buckets;
}

function countByStatus(rows: { status: string }[]) {
  const c: Record<string, number> = { pending: 0, accepted: 0, declined: 0, withdrawn: 0 };
  rows.forEach((r) => {
    if (c[r.status] != null) c[r.status]++;
  });
  return c;
}

export default async function ProposalsPage({ searchParams: searchParamsP }: { searchParams?: Promise<{ tab?: string }> }) {
  const searchParams = (await searchParamsP) || {};
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: sent } = await supabase
    .from("proposals")
    .select("*, job:jobs!proposals_job_id_fkey(id, title, category)")
    .eq("creative_id", user.id)
    .order("created_at", { ascending: false });

  const { data: received } = await supabase
    .from("proposals")
    .select("*, job:jobs!proposals_job_id_fkey!inner(id, title, client_id), creative:profiles!proposals_creative_id_fkey(id, full_name)")
    .eq("job.client_id", user.id)
    .order("created_at", { ascending: false });

  const tab: Tab = searchParams?.tab === "received" ? "received" : "sent";
  const sentCount = sent?.length || 0;
  const receivedCount = received?.length || 0;

  const activeRows = (tab === "sent" ? sent : received) || [];
  const buckets = weeklyBuckets(activeRows as any, 8);
  const statusCounts = countByStatus(activeRows as any);
  const totalThisPeriod = buckets.reduce((s, b) => s + b.count, 0);

  const sentBuckets = weeklyBuckets((sent as any) || [], 8);
  const receivedBuckets = weeklyBuckets((received as any) || [], 8);

  const fmtWeek = (ts: number) =>
    new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const activityData = buckets.map((b) => ({ label: fmtWeek(b.ts), value: b.count }));
  const compareData = sentBuckets.map((sb, i) => ({
    label: fmtWeek(sb.ts),
    sent: sb.count,
    received: receivedBuckets[i]?.count || 0,
  }));

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow">Pipeline</p>
        <h1 className="mt-1 text-3xl font-display font-semibold text-ink">Proposals</h1>
        <p className="mt-1 text-sm text-ink/60">Bids you&apos;ve put out and bids waiting on your call.</p>
      </header>

      <section className="card-soft p-6">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="eyebrow">Activity · last 8 weeks</p>
            <p className="mt-1 text-2xl font-display font-semibold text-ink">
              {totalThisPeriod} <span className="text-sm font-sans font-normal text-ink/55">{tab === "sent" ? "sent" : "received"}</span>
            </p>
          </div>
          <div className="hidden gap-2 sm:flex">
            <StatPill label="Pending" value={statusCounts.pending} tone="ink" />
            <StatPill label="Accepted" value={statusCounts.accepted} tone="mark" />
            <StatPill label="Declined" value={statusCounts.declined} tone="stamp" />
          </div>
        </div>

        <div className="mt-5">
          <PeriodBarChart data={activityData} format="count" highlightLast seriesLabel="Proposals" height={160} />
        </div>

        <div className="mt-5 flex flex-wrap gap-2 sm:hidden">
          <StatPill label="Pending" value={statusCounts.pending} tone="ink" />
          <StatPill label="Accepted" value={statusCounts.accepted} tone="mark" />
          <StatPill label="Declined" value={statusCounts.declined} tone="stamp" />
        </div>
      </section>

      <section className="card-soft p-6">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="eyebrow">Sent vs received · last 8 weeks</p>
            <p className="mt-1 text-sm text-ink/55">Side-by-side weekly volume.</p>
          </div>
          <div className="flex gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5 text-ink/70">
              <span className="h-2.5 w-2.5 rounded-sm bg-stamp" /> Sent <span className="font-semibold text-ink">{sentCount}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-ink/70">
              <span className="h-2.5 w-2.5 rounded-sm bg-ink/70" /> Received <span className="font-semibold text-ink">{receivedCount}</span>
            </span>
          </div>
        </div>

        <div className="mt-5">
          <TwoSeriesBarChart
            data={compareData}
            aKey="sent"
            bKey="received"
            aLabel="Sent"
            bLabel="Received"
            height={160}
          />
        </div>
      </section>

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

function StatPill({ label, value, tone }: { label: string; value: number; tone: "ink" | "mark" | "stamp" }) {
  const toneClass =
    tone === "mark"
      ? "bg-mark/10 text-mark"
      : tone === "stamp"
      ? "bg-stamp/10 text-stamp"
      : "bg-ink/10 text-ink/75";
  return (
    <div className={`flex items-baseline gap-1.5 rounded-lg px-3 py-1.5 ${toneClass}`}>
      <span className="text-sm font-semibold">{value}</span>
      <span className="text-[10px] uppercase tracking-wider opacity-80">{label}</span>
    </div>
  );
}
