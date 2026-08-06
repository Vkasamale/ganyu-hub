import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PeriodBarChart, OutcomeDonutChart } from "@/components/admin-charts";
import { CountUp } from "@/components/animated";
import { formatMwk } from "@/lib/utils";
import { getReleasedSpend } from "@/lib/money";
import { WelcomeChecklist, type ChecklistStep } from "@/components/welcome-checklist";

type Role = "client" | "creative" | "agency";

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const role: Role = (profile?.role as Role) || "creative";
  const isClient = role === "client";

  const now = new Date();
  let myJobs: any[] = [];
  let acceptedJobs: any[] = [];
  let proposalsSent: any[] = [];
  let proposalsOnMyJobs: any[] = [];

  if (isClient) {
    const { data: jobs } = await supabase
      .from("jobs")
      .select("id, title, status, budget_mwk, escrow_status, created_at")
      .eq("client_id", user.id)
      .order("created_at", { ascending: false });
    myJobs = jobs || [];
    const jobIds = myJobs.map((j) => j.id);
    if (jobIds.length) {
      const { data: props } = await supabase
        .from("proposals")
        .select("id, job_id, creative_id, status, bid_mwk, created_at, profiles:profiles!proposals_creative_id_fkey(full_name)")
        .in("job_id", jobIds)
        .order("created_at", { ascending: false });
      proposalsOnMyJobs = props || [];
    }
  } else {
    const { data: props } = await supabase
      .from("proposals")
      .select("id, job_id, status, bid_mwk, created_at, jobs:jobs!proposals_job_id_fkey(id, title, status, budget_mwk, client_id, profiles:profiles!jobs_client_id_fkey(full_name))")
      .eq("creative_id", user.id)
      .order("created_at", { ascending: false });
    proposalsSent = props || [];
    acceptedJobs = proposalsSent
      .filter((p) => p.status === "accepted" && p.jobs)
      .map((p) => ({ ...p.jobs, accepted_bid_mwk: p.bid_mwk, proposal_id: p.id }));
  }

  let insights: {
    totals: { views_total: number; views_30d: number; saves_total: number; saves_30d: number } | null;
    dailyViews: { label: string; value: number }[];
  } = { totals: null, dailyViews: [] };
  if (!isClient) {
    const [{ data: totalsRow }, { data: dailyRows }] = await Promise.all([
      supabase.rpc("creative_totals", { p_creative_id: user.id }).single(),
      supabase.rpc("creative_daily_views", { p_creative_id: user.id, p_days: 30 }),
    ]);
    const map = new Map<string, number>();
    (dailyRows || []).forEach((r: { day: string; views: number }) => map.set(r.day, Number(r.views)));
    const days: { label: string; value: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push({ label: d.toLocaleString("en", { month: "short", day: "numeric" }), value: map.get(key) || 0 });
    }
    insights = {
      totals: (totalsRow as typeof insights.totals) || null,
      dailyViews: days,
    };
  }

  const ACTIVE = new Set(["scope_pending", "in_progress", "submitted", "revision_requested"]);
  const stats = isClient
    ? [
        { label: "Active jobs", value: String(myJobs.filter((j) => ACTIVE.has(j.status)).length) },
        { label: "Open posts", value: String(myJobs.filter((j) => j.status === "open").length) },
        { label: "Proposals to review", value: String(proposalsOnMyJobs.filter((p) => p.status === "pending").length) },
        { label: "In escrow", value: formatMwk(myJobs.filter((j) => j.escrow_status === "payment_held").reduce((s, j) => s + (j.budget_mwk || 0), 0)), mono: true },
      ]
    : [
        { label: "Active jobs", value: String(acceptedJobs.filter((j) => ACTIVE.has(j.status)).length) },
        { label: "Proposals sent", value: String(proposalsSent.length) },
        { label: "Acceptance rate", value: proposalsSent.length ? `${Math.round((proposalsSent.filter((p) => p.status === "accepted").length / proposalsSent.length) * 100)}%` : "—" },
        { label: "Earned", value: formatMwk(acceptedJobs.filter((j) => j.status === "completed").reduce((s, j) => s + (j.accepted_bid_mwk || 0), 0)), mono: true },
      ];

  // Client "spend" = released escrow only (see lib/money.ts). Creative keeps
  // earnings from completed accepted proposals.
  const completedSet = isClient
    ? myJobs.filter((j) => j.escrow_status === "payment_released")
    : acceptedJobs.filter((j) => j.status === "completed");
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const releasedSpend6mo = isClient ? await getReleasedSpend(user.id, sixMonthsAgo) : 0;
  const months: { label: string; value: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ label: d.toLocaleString("en", { month: "short" }), value: 0 });
  }
  completedSet.forEach((j: any) => {
    const created = new Date(j.created_at);
    const diffMonths = (now.getFullYear() - created.getFullYear()) * 12 + (now.getMonth() - created.getMonth());
    if (diffMonths >= 0 && diffMonths < 6) {
      months[5 - diffMonths].value += isClient ? j.budget_mwk || 0 : j.accepted_bid_mwk || 0;
    }
  });

  const donut = isClient
    ? {
        center: String(myJobs.filter((j) => j.escrow_status === "payment_released").length),
        centerLabel: "Released",
        slices: [
          { label: "Held", value: myJobs.filter((j) => j.escrow_status === "payment_held").length, color: "#069494" },
          { label: "Released", value: myJobs.filter((j) => j.escrow_status === "payment_released").length, color: "#2F5D3B" },
        ],
      }
    : {
        center: String(proposalsSent.filter((p) => p.status === "accepted").length),
        centerLabel: "Accepted",
        slices: [
          { label: "Accepted", value: proposalsSent.filter((p) => p.status === "accepted").length, color: "#2F5D3B" },
          { label: "Pending", value: proposalsSent.filter((p) => p.status === "pending").length, color: "#069494" },
          { label: "Declined", value: proposalsSent.filter((p) => p.status === "declined").length, color: "#DACFB2" },
        ],
      };

  const projects = isClient
    ? myJobs.filter((j) => ACTIVE.has(j.status)).slice(0, 5).map((j) => ({ id: j.id, title: j.title, counterparty: "—", status: j.status }))
    : acceptedJobs.filter((j: any) => ACTIVE.has(j.status)).slice(0, 5).map((j: any) => ({
        id: j.id,
        title: j.title,
        counterparty: j.profiles?.full_name || "Client",
        status: j.status,
      }));

  const checklistSteps: ChecklistStep[] = isClient
    ? [
        { label: "Complete your profile", sub: "So creatives know who they're working with", href: "/dashboard/profile", done: !!profile?.onboarded_at },
        { label: "Post your first job", sub: "Describe what you need — creatives come to you", href: "/jobs/new", done: myJobs.length > 0 },
        { label: "See how the money works", sub: "Escrow, fees and payouts explained", href: "/how-money-works", done: !!profile?.money_guide_seen_at },
      ]
    : [
        { label: "Complete your profile", sub: "Add work so clients pick you", href: "/dashboard/profile", done: !!profile?.onboarded_at },
        { label: "Send your first proposal", sub: "Browse open jobs and bid", href: "/jobs", done: proposalsSent.length > 0 },
        { label: "See how payouts work", sub: "What you keep after fees", href: "/how-money-works", done: !!profile?.money_guide_seen_at },
      ];

  return (
    <div className="space-y-6">
      <WelcomeChecklist steps={checklistSteps} dismissed={!!profile?.welcome_dismissed_at} />
      <header>
        <p className="eyebrow">{role} workspace</p>
        <h1 className="mt-2 font-display text-3xl md:text-4xl">
          Welcome back,{" "}
          <em className="text-stamp" style={{ fontStyle: "italic", fontVariationSettings: '"opsz" 144, "SOFT" 100, "WONK" 1' }}>
            {profile?.full_name?.split(" ")[0] || "there"}.
          </em>
        </h1>
      </header>

      <section className="grid grid-cols-2 gap-5 md:grid-cols-4">
        {stats.map((s) => {
          const n = parseInt(String(s.value).replace(/[^\d]/g, ""), 10);
          const canCount = !isNaN(n) && n > 0;
          return (
            <div key={s.label} className="card-soft p-6">
              <p className="text-xs uppercase tracking-wider text-ink/55">{s.label}</p>
              <p className={`mt-2 font-display text-2xl text-ink ${s.mono ? "tabular-nums" : ""}`}>
                {canCount ? <CountUp value={n} format={s.mono ? "mwk" : "number"} /> : s.value}
              </p>
            </div>
          );
        })}
      </section>

      {!isClient && insights.totals && (
        <section className="card-soft p-7">
          <div className="flex items-baseline justify-between">
            <p className="font-display text-lg">Profile insights</p>
            <p className="text-xs uppercase tracking-wider text-ink/55">Last 30 days</p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-ink/55">Views (30d)</p>
              <p className="mt-1 font-display text-2xl text-ink">
                <CountUp value={insights.totals.views_30d} format="number" />
              </p>
              <p className="mt-0.5 text-xs text-ink/50">{insights.totals.views_total} all-time</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-ink/55">Saves (30d)</p>
              <p className="mt-1 font-display text-2xl text-ink">
                <CountUp value={insights.totals.saves_30d} format="number" />
              </p>
              <p className="mt-0.5 text-xs text-ink/50">{insights.totals.saves_total} all-time</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-ink/55">Proposals sent</p>
              <p className="mt-1 font-display text-2xl text-ink">
                <CountUp value={proposalsSent.length} format="number" />
              </p>
              <p className="mt-0.5 text-xs text-ink/50">{proposalsSent.filter((p) => p.status === "accepted").length} accepted</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-ink/55">Save rate</p>
              <p className="mt-1 font-display text-2xl text-ink">
                {insights.totals.views_30d > 0
                  ? `${Math.round((insights.totals.saves_30d / insights.totals.views_30d) * 100)}%`
                  : "—"}
              </p>
              <p className="mt-0.5 text-xs text-ink/50">saves ÷ views</p>
            </div>
          </div>
          <div className="mt-6">
            <PeriodBarChart data={insights.dailyViews} format="count" />
          </div>
        </section>
      )}

      <section className="grid gap-5 md:grid-cols-[1.5fr_1fr]">
        <div className="card-soft p-7">
          <div className="flex items-baseline justify-between">
            <p className="font-display text-lg">{isClient ? "Released, last 6 months" : "Earned, last 6 months"}</p>
            <p className="font-mono text-sm tabular-nums text-ink/70">
              {(() => {
                const total = isClient ? releasedSpend6mo : months.reduce((s, m) => s + m.value, 0);
                return total ? `MWK ${total.toLocaleString()}` : "—";
              })()}
            </p>
          </div>
          <div className="mt-4">
            <PeriodBarChart data={months} format="mwk" />
          </div>
        </div>
        <div className="card-soft p-7">
          <p className="font-display text-lg">{isClient ? "Escrow status" : "Proposal outcomes"}</p>
          <div className="mt-4 flex items-center gap-5">
            <div className="h-40 w-40 shrink-0">
              <OutcomeDonutChart
                data={donut.slices.map((s) => ({ label: s.label, value: s.value, color: s.color }))}
                centerValue={donut.center}
                centerLabel={donut.centerLabel}
              />
            </div>
            <ul className="flex-1 space-y-1.5 text-xs">
              {donut.slices.map((s) => (
                <li key={s.label} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2">
                    <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                    <span className="text-ink/75">{s.label}</span>
                  </span>
                  <span className="tabular-nums text-ink">{s.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="card-soft overflow-hidden">
        <div className="flex items-center justify-between border-b border-ink/[0.06] px-6 py-4">
          <p className="font-display text-lg">Active jobs</p>
          <Link href="/dashboard/jobs" className="text-xs text-ink/65 underline decoration-ink/30 underline-offset-4 hover:text-ink">
            See all →
          </Link>
        </div>
        {projects.length === 0 ? (
          <p className="px-6 py-8 text-sm text-ink/55">
            No active jobs yet.{" "}
            <Link href={isClient ? "/jobs/new" : "/jobs"} className="text-stamp-dark underline underline-offset-4">
              {isClient ? "Post a job" : "Find jobs"}
            </Link>
            .
          </p>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-ink/55">
                <th className="px-6 py-3 font-medium">Job</th>
                <th className="px-6 py-3 font-medium">{isClient ? "" : "Client"}</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/[0.06]">
              {projects.map((p) => (
                <tr key={p.id}>
                  <td className="px-6 py-4 font-medium">{p.title}</td>
                  <td className="px-6 py-4 text-ink/70">{isClient ? "" : p.counterparty}</td>
                  <td className="px-6 py-4"><StatusBadge status={p.status} /></td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/jobs/${p.id}`} className="text-xs text-stamp-dark underline underline-offset-4 hover:text-stamp-dark">
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </section>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; fg: string; label: string }> = {
    open: { bg: "bg-ink/10", fg: "text-ink/70", label: "Open" },
    scope_pending: { bg: "bg-mark/10", fg: "text-mark", label: "Scope" },
    in_progress: { bg: "bg-mark/10", fg: "text-mark", label: "In progress" },
    submitted: { bg: "bg-stamp/10", fg: "text-stamp-dark", label: "Submitted" },
    revision_requested: { bg: "bg-stamp/10", fg: "text-stamp-dark", label: "Revisions" },
    disputed: { bg: "bg-stamp/15", fg: "text-stamp-dark", label: "Disputed" },
    completed: { bg: "bg-mark/10", fg: "text-mark", label: "Completed" },
    cancelled: { bg: "bg-ink/10", fg: "text-ink/55", label: "Cancelled" },
  };
  const s = map[status] || map.open;
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${s.bg} ${s.fg}`}>{s.label}</span>;
}
