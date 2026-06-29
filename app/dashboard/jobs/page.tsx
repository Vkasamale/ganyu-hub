import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatMwk, timeAgo } from "@/lib/utils";

type Role = "client" | "creative" | "agency";

type Tab = "active" | "completed" | "proposals";

export default async function DashboardJobsPage({ searchParams }: { searchParams?: { tab?: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const role: Role = (profile?.role as Role) || "creative";
  const isClient = role === "client";

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

  type Row = {
    id: string;
    jobId: string;
    title: string;
    category: string | null;
    status: string;
    amount: number;
    created_at: string;
    isPosted: boolean;
    proposalCount?: number;
  };

  const postedRows: Row[] = (posted || []).map((j: any) => ({
    id: `p-${j.id}`,
    jobId: j.id,
    title: j.title,
    category: j.category,
    status: j.status,
    amount: j.budget_mwk || 0,
    created_at: j.created_at,
    isPosted: true,
    proposalCount: j.proposals?.[0]?.count || 0,
  }));

  const engagedRows: Row[] = (engagements || [])
    .filter((e: any) => e.status === "accepted" && e.job)
    .map((e: any) => ({
      id: `e-${e.id}`,
      jobId: e.job.id,
      title: e.job.title,
      category: e.job.category,
      status: e.job.status,
      amount: e.bid_mwk || 0,
      created_at: e.created_at,
      isPosted: false,
    }));

  const allRows = [...postedRows, ...engagedRows];
  const activeRows = allRows.filter((r) => !CLOSED.has(r.status));
  const completedRows = allRows.filter((r) => CLOSED.has(r.status));
  const otherProposals = (engagements || []).filter((e: any) => e.status !== "accepted");

  const totalValue = completedRows.reduce((s, r) => s + r.amount, 0);
  const stats = [
    { label: "Active", value: String(activeRows.length) },
    { label: "Completed", value: String(completedRows.filter((r) => r.status === "completed").length) },
    { label: isClient ? "Posted" : "Engagements", value: String(isClient ? postedRows.length : engagedRows.length) },
    { label: isClient ? "Total spent" : "Total earned", value: formatMwk(totalValue), mono: true },
  ];

  const now = new Date();
  const months: { label: string; value: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ label: d.toLocaleString("en", { month: "short" }), value: 0 });
  }
  allRows.forEach((r) => {
    const created = new Date(r.created_at);
    const diffMonths = (now.getFullYear() - created.getFullYear()) * 12 + (now.getMonth() - created.getMonth());
    if (diffMonths >= 0 && diffMonths < 6) months[5 - diffMonths].value += 1;
  });

  const statusGroups = [
    { label: "Open", statuses: ["open"], color: "#1A1611" },
    { label: "In progress", statuses: ["scope_pending", "in_progress", "submitted", "revision_requested"], color: "#2F5D3B" },
    { label: "Completed", statuses: ["completed"], color: "#B6332A" },
    { label: "Other", statuses: ["disputed", "cancelled"], color: "#DACFB2" },
  ];
  const donutSlices = statusGroups
    .map((g) => ({ label: g.label, value: allRows.filter((r) => g.statuses.includes(r.status)).length, color: g.color }))
    .filter((s) => s.value > 0);
  const donut = {
    center: String(activeRows.length),
    centerLabel: "Active",
    slices: donutSlices.length ? donutSlices : [{ label: "—", value: 1, color: "#DACFB2" }],
  };

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Jobs</p>
          <h1 className="mt-2 font-display text-3xl md:text-4xl">
            Your{" "}
            <em className="text-stamp" style={{ fontStyle: "italic", fontVariationSettings: '"opsz" 144, "SOFT" 100, "WONK" 1' }}>
              ledger.
            </em>
          </h1>
          <p className="mt-2 text-sm text-ink/60">Every job you posted or worked on.</p>
        </div>
        {isClient && (
          <Link href="/jobs/new" className="rounded-full bg-stamp px-5 py-2 text-sm font-medium text-paper transition-colors hover:bg-stamp-dark">
            Post a job
          </Link>
        )}
      </header>

      <section className="grid grid-cols-2 gap-5 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card-soft p-6">
            <p className="text-xs uppercase tracking-wider text-ink/55">{s.label}</p>
            <p className={`mt-2 font-display text-2xl text-ink ${s.mono ? "tabular-nums" : ""}`}>{s.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-5 md:grid-cols-[1.5fr_1fr]">
        <BarChart title="Jobs per month, last 6" months={months} />
        <DonutChart title="Status spread" donut={donut} />
      </section>

      {(() => {
        const raw = (searchParams?.tab as Tab) || "active";
        const tab: Tab = (["active", "completed", "proposals"] as Tab[]).includes(raw) ? raw : "active";
        const tabs: { key: Tab; label: string; count: number }[] = [
          { key: "active", label: "Active", count: activeRows.length },
          { key: "completed", label: "Completed", count: completedRows.length },
          { key: "proposals", label: "Proposals", count: otherProposals.length },
        ];
        return (
          <section className="card-soft overflow-hidden">
            <div className="flex items-center gap-1 border-b border-ink/[0.06] px-3 py-2">
              {tabs.map((t) => {
                const active = tab === t.key;
                return (
                  <Link
                    key={t.key}
                    href={`/dashboard/jobs?tab=${t.key}`}
                    scroll={false}
                    className={
                      active
                        ? "rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper"
                        : "rounded-md px-4 py-2 text-sm text-ink/70 transition-colors hover:bg-wash/60 hover:text-ink"
                    }
                  >
                    {t.label}
                    <span className={`ml-2 tabular-nums text-xs ${active ? "text-paper/70" : "text-ink/45"}`}>{t.count}</span>
                  </Link>
                );
              })}
            </div>

            {tab === "active" && (
              <JobsTableBody
                rows={activeRows}
                empty={
                  <>
                    No active jobs.{" "}
                    <Link href={isClient ? "/jobs/new" : "/jobs"} className="text-stamp underline underline-offset-4">
                      {isClient ? "Post a job" : "Find jobs"}
                    </Link>
                    .
                  </>
                }
              />
            )}
            {tab === "completed" && <JobsTableBody rows={completedRows} empty={<>Nothing completed yet.</>} />}
            {tab === "proposals" && <ProposalsTableBody rows={otherProposals} />}
          </section>
        );
      })()}
    </div>
  );
}

function JobsTableBody({ rows, empty }: { rows: any[]; empty: React.ReactNode }) {
  if (rows.length === 0) return <p className="px-6 py-10 text-sm text-ink/55">{empty}</p>;
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-xs uppercase tracking-wider text-ink/55">
          <th className="px-6 py-3 font-medium">Job</th>
          <th className="px-6 py-3 font-medium">Role</th>
          <th className="px-6 py-3 font-medium">Amount</th>
          <th className="px-6 py-3 font-medium">Status</th>
          <th className="px-6 py-3 font-medium">When</th>
          <th className="px-6 py-3 font-medium" />
        </tr>
      </thead>
      <tbody className="divide-y divide-ink/[0.06]">
        {rows.map((r) => (
          <tr key={r.id}>
            <td className="px-6 py-4">
              <p className="font-medium">{r.title}</p>
              {r.category && (
                <p className="mt-0.5 text-xs text-ink/55">
                  {r.category}
                  {r.isPosted && r.proposalCount != null ? ` · ${r.proposalCount} proposal${r.proposalCount === 1 ? "" : "s"}` : ""}
                </p>
              )}
            </td>
            <td className="px-6 py-4 text-xs text-ink/65">{r.isPosted ? "Posted" : "Working on"}</td>
            <td className="px-6 py-4 tabular-nums text-ink/80">{formatMwk(r.amount)}</td>
            <td className="px-6 py-4"><StatusBadge status={r.status} /></td>
            <td className="px-6 py-4 text-xs text-ink/60">{timeAgo(r.created_at)}</td>
            <td className="px-6 py-4 text-right">
              <Link href={`/jobs/${r.jobId}`} className="text-xs text-stamp underline underline-offset-4 hover:text-stamp-dark">
                Open →
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ProposalsTableBody({ rows }: { rows: any[] }) {
  if (rows.length === 0) return <p className="px-6 py-10 text-sm text-ink/55">No other proposals — accepted ones live under Active.</p>;
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-xs uppercase tracking-wider text-ink/55">
          <th className="px-6 py-3 font-medium">Job</th>
          <th className="px-6 py-3 font-medium">Bid</th>
          <th className="px-6 py-3 font-medium">Proposal</th>
          <th className="px-6 py-3 font-medium">Sent</th>
          <th className="px-6 py-3 font-medium" />
        </tr>
      </thead>
      <tbody className="divide-y divide-ink/[0.06]">
        {rows.map((p: any) => (
          <tr key={p.id}>
            <td className="px-6 py-4 font-medium">{p.job?.title || "—"}</td>
            <td className="px-6 py-4 tabular-nums text-ink/80">{formatMwk(p.bid_mwk)}</td>
            <td className="px-6 py-4"><ProposalBadge status={p.status} /></td>
            <td className="px-6 py-4 text-xs text-ink/60">{timeAgo(p.created_at)}</td>
            <td className="px-6 py-4 text-right">
              <Link href={`/jobs/${p.job?.id}`} className="text-xs text-stamp underline underline-offset-4 hover:text-stamp-dark">
                Open →
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function BarChart({ title, months }: { title: string; months: { label: string; value: number }[] }) {
  const max = Math.max(...months.map((m) => m.value), 1);
  const total = months.reduce((s, m) => s + m.value, 0);
  return (
    <div className="card-soft p-7">
      <div className="flex items-baseline justify-between">
        <p className="font-display text-lg">{title}</p>
        <p className="font-mono text-sm tabular-nums text-ink/70">{total}</p>
      </div>
      <svg viewBox="0 0 320 140" className="mt-4 h-32 w-full">
        <line x1="0" y1="120" x2="320" y2="120" stroke="#1A1611" strokeOpacity="0.15" strokeWidth="1" />
        {months.map((m, i) => {
          const x = 12 + i * 52;
          const h = max > 0 ? (m.value / max) * 96 : 0;
          return (
            <g key={i}>
              <rect x={x} y={120 - h} width="32" height={h} fill="#B6332A" rx="2" />
              <text x={x + 16} y="135" fontSize="10" textAnchor="middle" fill="#1A1611" opacity="0.55" fontFamily="var(--font-plex-mono), monospace">
                {m.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function DonutChart({
  title,
  donut,
}: {
  title: string;
  donut: { center: string; centerLabel: string; slices: { label: string; value: number; color: string }[] };
}) {
  const total = donut.slices.reduce((s, x) => s + x.value, 0) || 1;
  const R = 50;
  const C = 2 * Math.PI * R;
  let offset = 0;
  return (
    <div className="card-soft p-7">
      <p className="font-display text-lg">{title}</p>
      <div className="mt-4 flex items-center gap-5">
        <svg viewBox="0 0 130 130" className="h-32 w-32 shrink-0">
          <circle cx="65" cy="65" r={R} fill="none" stroke="#1A1611" strokeOpacity="0.08" strokeWidth="14" />
          {donut.slices.map((s, i) => {
            const len = total > 0 ? (s.value / total) * C : 0;
            const dasharray = `${len} ${C - len}`;
            const dashoffset = -offset;
            offset += len;
            return (
              <circle key={i} cx="65" cy="65" r={R} fill="none" stroke={s.color} strokeWidth="14" strokeDasharray={dasharray} strokeDashoffset={dashoffset} transform="rotate(-90 65 65)" />
            );
          })}
          <text x="65" y="62" textAnchor="middle" fill="#1A1611" fontSize="22" fontFamily="var(--font-fraunces), Georgia, serif">
            {donut.center}
          </text>
          <text x="65" y="78" textAnchor="middle" fill="#1A1611" opacity="0.6" fontSize="9" fontFamily="var(--font-plex-mono), monospace" letterSpacing="1">
            {donut.centerLabel.toUpperCase()}
          </text>
        </svg>
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
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; fg: string; label: string }> = {
    open: { bg: "bg-ink/10", fg: "text-ink/70", label: "Open" },
    scope_pending: { bg: "bg-mark/10", fg: "text-mark", label: "Scope" },
    in_progress: { bg: "bg-mark/10", fg: "text-mark", label: "In progress" },
    submitted: { bg: "bg-stamp/10", fg: "text-stamp", label: "Submitted" },
    revision_requested: { bg: "bg-stamp/10", fg: "text-stamp", label: "Revisions" },
    disputed: { bg: "bg-stamp/15", fg: "text-stamp", label: "Disputed" },
    completed: { bg: "bg-mark/10", fg: "text-mark", label: "Completed" },
    cancelled: { bg: "bg-ink/10", fg: "text-ink/55", label: "Cancelled" },
  };
  const s = map[status] || map.open;
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${s.bg} ${s.fg}`}>{s.label}</span>;
}

function ProposalBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; fg: string; label: string }> = {
    pending: { bg: "bg-ink/10", fg: "text-ink/70", label: "Pending" },
    accepted: { bg: "bg-mark/10", fg: "text-mark", label: "Accepted" },
    declined: { bg: "bg-stamp/10", fg: "text-stamp", label: "Declined" },
    withdrawn: { bg: "bg-ink/10", fg: "text-ink/55", label: "Withdrawn" },
  };
  const s = map[status] || map.pending;
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${s.bg} ${s.fg}`}>{s.label}</span>;
}
