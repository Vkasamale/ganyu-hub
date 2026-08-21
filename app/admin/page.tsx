import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/supabase/user";
import {
  SignupsLineChart,
  JobStatusBarChart,
  JobCategoryBarChart,
  PeriodBarChart,
} from "@/components/admin-charts";
import { PLATFORM_COMMISSION, BETA_ZERO_COMMISSION } from "@/lib/fees";

export default async function AdminPage() {
  const supabase = createClient();
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const { data: me } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!me?.is_admin) notFound();

  const sinceDays = 30;
  const sinceIso = new Date(Date.now() - sinceDays * 24 * 60 * 60 * 1000).toISOString();
  const weeks = 8;
  const trendSinceIso = new Date(Date.now() - weeks * 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: disputedCount },
    { count: cancellationCount },
    { count: userCount },
    { count: jobCount },
    { count: openCount },
    { data: signupSeries },
    { data: jobStatusRows },
    { data: jobCategoryRows },
    { count: errorCount },
    { data: moneyJobs },
    { data: trendJobs },
    { data: signupTrend },
    { data: disputeTrend },
    { data: roleRows },
  ] = await Promise.all([
    supabase.from("jobs").select("*", { count: "exact", head: true }).eq("status", "disputed"),
    supabase.from("jobs").select("*", { count: "exact", head: true }).eq("status", "cancellation_requested"),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("jobs").select("*", { count: "exact", head: true }),
    supabase.from("jobs").select("*", { count: "exact", head: true }).eq("status", "open"),
    supabase.from("profiles").select("created_at, role").gte("created_at", sinceIso),
    supabase.from("jobs").select("status, profiles:profiles!jobs_client_id_fkey(role)"),
    supabase.from("jobs").select("category, profiles:profiles!jobs_client_id_fkey(role)"),
    supabase.from("admin_errors").select("*", { count: "exact", head: true }).is("resolved_at", null),
    supabase
      .from("jobs")
      .select(
        "status, escrow_status, total_paid_mwk, accepted_bid_mwk, payout_amount_mwk, cancellation_client_refund_mwk, cancellation_creative_cut_mwk",
      ),
    supabase
      .from("jobs")
      .select("created_at, total_paid_mwk, accepted_bid_mwk, escrow_status")
      .gte("created_at", trendSinceIso),
    supabase.from("profiles").select("created_at").gte("created_at", trendSinceIso),
    supabase
      .from("jobs")
      .select("created_at")
      .eq("status", "disputed")
      .gte("created_at", trendSinceIso),
    supabase.from("profiles").select("role"),
  ]);

  const money = summarizeMoney(moneyJobs || []);
  const trends = weeklyBuckets(weeks);
  fillWeekly(trends, trendJobs || [], (row, b) => {
    const bid = row.total_paid_mwk ?? row.accepted_bid_mwk ?? 0;
    const funded = row.escrow_status === "payment_held" || row.escrow_status === "payment_released";
    if (funded) {
      b.gmv += bid;
      b.jobs += 1;
    } else {
      b.posted += 1;
    }
  });
  fillWeekly(trends, signupTrend || [], (_row, b) => {
    b.signups += 1;
  });
  fillWeekly(trends, disputeTrend || [], (_row, b) => {
    b.disputes += 1;
  });

  const gmvTrend = trends.map((t) => ({ label: t.label, value: t.gmv }));
  const signupsTrend = trends.map((t) => ({ label: t.label, value: t.signups }));
  const postedTrend = trends.map((t) => ({ label: t.label, value: t.posted + t.jobs }));
  const disputesTrend = trends.map((t) => ({ label: t.label, value: t.disputes }));

  const roleCounts = countRoles(roleRows || []);
  const signupsByDay = bucketByDayByRole(signupSeries || [], sinceDays);
  const jobStatusCounts = splitByRole(jobStatusRows || [], "status");
  const jobCategoryCounts = splitByRole(jobCategoryRows || [], "category");

  return (
    <div className="space-y-10">
      <header>
        <p className="eyebrow">Analytics</p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-ink">Admin overview</h1>
        <p className="mt-1 text-sm text-ink/60">Money, activity, and moderation queues.</p>
      </header>

      <section id="money" className="scroll-mt-24">
        <div className="flex items-baseline justify-between">
          <p className="eyebrow">Money</p>
          <span className="text-xs text-ink/50">All-time · MWK</span>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <MoneyTile label="GMV" value={money.gmv} tone="stamp" help="Total moved through the platform (funded jobs)." />
          <MoneyTile
            label={BETA_ZERO_COMMISSION ? "Platform revenue (waived during beta)" : "Platform revenue"}
            value={money.revenue}
            tone="stamp"
            help={BETA_ZERO_COMMISSION
              ? "Theoretical 15% commission on completed jobs + cancellation take. NOT collected — creatives keep 100% during beta."
              : "15% commission on completed jobs + cancellation take."}
          />
          <MoneyTile label="In escrow" value={money.inEscrow} tone="warn" help="Client funds we're currently holding." />
          <MoneyTile label="Paid to creatives" value={money.payouts} tone="ink" help="Sum of released payouts (net of payout fees)." />
          <MoneyTile label="Refunded to clients" value={money.refunds} tone="ink" help="Cancellation refunds paid back to clients." />
          <MoneyTile label="Avg completed job" value={money.avgCompleted} tone="ink" help="Mean bid across completed jobs." />
        </div>
      </section>

      <section id="trends" className="scroll-mt-24">
        <div className="flex items-baseline justify-between">
          <p className="eyebrow">Trends · last {weeks} weeks (weekly)</p>
          <span className="text-xs text-ink/50">Rightmost bar = this week</span>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <TrendCard title="GMV per week (MWK)" total={fmtMwk(money.gmv)}>
            <PeriodBarChart data={gmvTrend} format="mwk" highlightLast seriesLabel="GMV" />
          </TrendCard>
          <TrendCard title="Jobs posted per week" total={String(postedTrend.reduce((s, d) => s + d.value, 0))}>
            <PeriodBarChart data={postedTrend} format="count" highlightLast seriesLabel="Jobs" />
          </TrendCard>
          <TrendCard title="Signups per week" total={String(signupsTrend.reduce((s, d) => s + d.value, 0))}>
            <PeriodBarChart data={signupsTrend} format="count" highlightLast seriesLabel="Signups" />
          </TrendCard>
          <TrendCard title="Disputes per week" total={String(disputesTrend.reduce((s, d) => s + d.value, 0))}>
            <PeriodBarChart data={disputesTrend} format="count" highlightLast seriesLabel="Disputes" />
          </TrendCard>
        </div>
      </section>

      <section id="people" className="scroll-mt-24">
        <div className="flex items-baseline justify-between">
          <p className="eyebrow">People & activity</p>
          <span className="text-xs text-ink/50">{userCount || 0} users · {jobCount || 0} jobs</span>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile href="/admin/users?role=client" label="Clients" value={roleCounts.client} />
          <StatTile href="/admin/users?role=creative" label="Creatives" value={roleCounts.creative} />
          <StatTile href="/admin/users?role=agency" label="Agencies" value={roleCounts.agency} />
          <StatTile href="/admin/jobs?status=open" label="Open jobs" value={openCount || 0} />
        </div>
      </section>

      <section className="card-soft p-6">
        <div className="flex items-baseline justify-between">
          <p className="eyebrow">Daily signups · last {sinceDays} days</p>
          <span className="text-xs text-ink/55">
            {signupsByDay.reduce((s, d) => s + d.clients + d.creatives, 0)} new
          </span>
        </div>
        <div className="mt-4">
          <SignupsLineChart data={signupsByDay} />
        </div>
      </section>

      <div className="grid gap-3 md:grid-cols-2">
        <section className="card-soft p-6">
          <p className="eyebrow">Jobs by status</p>
          <div className="mt-4">
            <JobStatusBarChart data={jobStatusCounts} />
          </div>
        </section>
        <section className="card-soft p-6">
          <p className="eyebrow">Jobs by category</p>
          <div className="mt-4">
            <JobCategoryBarChart data={jobCategoryCounts} />
          </div>
        </section>
      </div>

      <section>
        <p className="eyebrow">Moderation queues</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <StatTile href="/admin/disputes" label="Disputes" value={disputedCount || 0} alert={(disputedCount || 0) > 0} />
          <StatTile href="/admin/cancellations" label="Cancellations" value={cancellationCount || 0} alert={(cancellationCount || 0) > 0} />
          <StatTile href="/admin/errors" label="Unresolved errors" value={errorCount || 0} alert={(errorCount || 0) > 0} />
        </div>
      </section>
    </div>
  );
}

function MoneyTile({
  label,
  value,
  tone,
  help,
}: {
  label: string;
  value: number;
  tone: "stamp" | "warn" | "ink";
  help?: string;
}) {
  const toneCls = tone === "stamp" ? "text-stamp-dark" : tone === "warn" ? "text-amber-600" : "text-ink";
  return (
    <div className="card-soft p-4" title={help}>
      <p className="text-[10px] font-medium uppercase tracking-wider text-ink/55">{label}</p>
      <p className={`mt-1 font-display text-2xl font-semibold ${toneCls}`}>{fmtMwk(value)}</p>
      {help && <p className="mt-1 text-[11px] leading-snug text-ink/50">{help}</p>}
    </div>
  );
}

function StatTile({
  href,
  label,
  value,
  alert,
}: {
  href: string;
  label: string;
  value: number;
  alert?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`card-soft group block p-4 transition-all hover:-translate-y-0.5 hover:border-ink/20 hover:shadow-elev-2 ${alert ? "ring-1 ring-stamp/40" : ""}`}
    >
      <p className="text-[10px] font-medium uppercase tracking-wider text-ink/55">{label}</p>
      <p className={`mt-1 font-display text-2xl font-semibold ${alert ? "text-stamp-dark" : "text-ink"}`}>
        {value.toLocaleString()}
      </p>
    </Link>
  );
}

function TrendCard({ title, total, children }: { title: string; total: string; children: React.ReactNode }) {
  return (
    <section className="card-soft p-5">
      <div className="flex items-baseline justify-between">
        <p className="text-xs font-medium text-ink/70">{title}</p>
        <span className="text-[11px] text-ink/50">{total} total</span>
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function fmtMwk(n: number): string {
  if (n >= 1_000_000) return `MWK ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `MWK ${(n / 1_000).toFixed(1)}k`;
  return `MWK ${n.toLocaleString()}`;
}

type MoneyJob = {
  status: string | null;
  escrow_status: string | null;
  total_paid_mwk: number | null;
  accepted_bid_mwk: number | null;
  payout_amount_mwk: number | null;
  cancellation_client_refund_mwk: number | null;
  cancellation_creative_cut_mwk: number | null;
};

function summarizeMoney(rows: MoneyJob[]) {
  let gmv = 0;
  let revenue = 0;
  let inEscrow = 0;
  let payouts = 0;
  let refunds = 0;
  let completedSum = 0;
  let completedCount = 0;

  for (const r of rows) {
    const bid = r.total_paid_mwk ?? r.accepted_bid_mwk ?? 0;
    const funded = r.escrow_status === "payment_held" || r.escrow_status === "payment_released";
    if (funded) gmv += bid;
    if (r.escrow_status === "payment_held") inEscrow += bid;
    if (r.status === "completed") {
      revenue += Math.round(bid * PLATFORM_COMMISSION);
      payouts += r.payout_amount_mwk ?? 0;
      completedSum += bid;
      completedCount += 1;
    }
    if (r.status === "cancelled") {
      const refund = r.cancellation_client_refund_mwk ?? 0;
      const cut = r.cancellation_creative_cut_mwk ?? 0;
      refunds += refund;
      revenue += Math.max(0, bid - refund - cut);
    }
  }

  return {
    gmv,
    revenue,
    inEscrow,
    payouts,
    refunds,
    avgCompleted: completedCount > 0 ? Math.round(completedSum / completedCount) : 0,
  };
}

type WeekBucket = { label: string; iso: string; gmv: number; jobs: number; posted: number; signups: number; disputes: number };

function weeklyBuckets(weeks: number): WeekBucket[] {
  const out: WeekBucket[] = [];
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  for (let i = weeks - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i * 7);
    const iso = d.toISOString().slice(0, 10);
    const label = `${d.getMonth() + 1}/${d.getDate()}`;
    out.push({ label, iso, gmv: 0, jobs: 0, posted: 0, signups: 0, disputes: 0 });
  }
  return out;
}

function fillWeekly<T extends { created_at?: string | null }>(
  buckets: WeekBucket[],
  rows: T[],
  add: (row: T, b: WeekBucket) => void,
) {
  const first = new Date(buckets[0].iso).getTime();
  for (const r of rows) {
    if (!r.created_at) continue;
    const t = new Date(r.created_at).getTime();
    if (t < first) continue;
    const weekIndex = Math.min(buckets.length - 1, Math.floor((t - first) / (7 * 24 * 60 * 60 * 1000)));
    add(r, buckets[weekIndex]);
  }
}

function countRoles(rows: { role: string | null }[]): { client: number; creative: number; agency: number } {
  const out = { client: 0, creative: 0, agency: 0 };
  for (const r of rows) {
    if (r.role === "client") out.client += 1;
    else if (r.role === "creative") out.creative += 1;
    else if (r.role === "agency") out.agency += 1;
  }
  return out;
}

type DayBucket = { day: string; clients: number; creatives: number };

function bucketByDayByRole(rows: { created_at: string; role: string }[], days: number): DayBucket[] {
  const buckets = new Map<string, { clients: number; creatives: number }>();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    buckets.set(d.toISOString().slice(0, 10), { clients: 0, creatives: 0 });
  }
  for (const r of rows) {
    const key = (r.created_at || "").slice(0, 10);
    const b = buckets.get(key);
    if (!b) continue;
    if (r.role === "client") b.clients += 1;
    else if (r.role === "creative" || r.role === "agency") b.creatives += 1;
  }
  return Array.from(buckets.entries()).map(([day, v]) => ({ day, ...v }));
}

function splitByRole<T extends Record<string, any>>(
  rows: T[],
  key: keyof T,
): { label: string; clients: number; creatives: number }[] {
  const m = new Map<string, { clients: number; creatives: number }>();
  for (const r of rows) {
    const label = ((r[key] ?? "unspecified") as string) || "unspecified";
    if (!m.has(label)) m.set(label, { clients: 0, creatives: 0 });
    const bucket = m.get(label)!;
    const role = (r as any).profiles?.role;
    if (role === "creative" || role === "agency") bucket.creatives += 1;
    else bucket.clients += 1;
  }
  return Array.from(m.entries())
    .map(([label, v]) => ({ label, ...v }))
    .sort((a, b) => b.clients + b.creatives - (a.clients + a.creatives));
}
