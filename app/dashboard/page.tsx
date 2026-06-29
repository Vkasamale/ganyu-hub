import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatMwk } from "@/lib/utils";

type Role = "client" | "creative" | "agency";

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (profile && !profile.onboarded_at) {
    redirect(profile.role === "client" ? "/onboarding/client" : "/onboarding/creative");
  }
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
      .select("id, job_id, status, bid_mwk, created_at, jobs:jobs!proposals_job_id_fkey(id, title, status, budget_mwk, client_id, creative_confirmed_scope_at, profiles:profiles!jobs_client_id_fkey(full_name))")
      .eq("creative_id", user.id)
      .order("created_at", { ascending: false });
    proposalsSent = props || [];
    acceptedJobs = proposalsSent
      .filter((p) => p.status === "accepted" && p.jobs)
      .map((p) => ({ ...p.jobs, accepted_bid_mwk: p.bid_mwk, proposal_id: p.id }));
  }

  const ACTIVE = new Set(["scope_pending", "in_progress", "submitted", "revision_requested"]);
  const stats = isClient
    ? [
        { label: "Active jobs", value: String(myJobs.filter((j) => ACTIVE.has(j.status)).length) },
        { label: "Open posts", value: String(myJobs.filter((j) => j.status === "open").length) },
        { label: "Proposals to review", value: String(proposalsOnMyJobs.filter((p) => p.status === "pending").length) },
        {
          label: "In escrow",
          value: formatMwk(myJobs.filter((j) => j.escrow_status === "payment_held").reduce((s, j) => s + (j.budget_mwk || 0), 0)),
          mono: true,
        },
      ]
    : [
        { label: "Active jobs", value: String(acceptedJobs.filter((j) => ACTIVE.has(j.status)).length) },
        { label: "Proposals sent", value: String(proposalsSent.length) },
        {
          label: "Acceptance rate",
          value: proposalsSent.length
            ? `${Math.round((proposalsSent.filter((p) => p.status === "accepted").length / proposalsSent.length) * 100)}%`
            : "—",
        },
        {
          label: "Earned",
          value: formatMwk(acceptedJobs.filter((j) => j.status === "completed").reduce((s, j) => s + (j.accepted_bid_mwk || 0), 0)),
          mono: true,
        },
      ];

  const completedSet = isClient
    ? myJobs.filter((j) => j.status === "completed")
    : acceptedJobs.filter((j) => j.status === "completed");
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
          { label: "Held", value: myJobs.filter((j) => j.escrow_status === "payment_held").length, color: "#B6332A" },
          { label: "Released", value: myJobs.filter((j) => j.escrow_status === "payment_released").length, color: "#2F5D3B" },
        ],
      }
    : {
        center: String(proposalsSent.filter((p) => p.status === "accepted").length),
        centerLabel: "Accepted",
        slices: [
          { label: "Accepted", value: proposalsSent.filter((p) => p.status === "accepted").length, color: "#2F5D3B" },
          { label: "Pending", value: proposalsSent.filter((p) => p.status === "pending").length, color: "#B6332A" },
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

  const reminders: { priority: "high" | "medium" | "low"; title: string; subtitle: string; href: string }[] = [];
  if (isClient) {
    myJobs.filter((j) => j.status === "scope_pending").forEach((j) =>
      reminders.push({ priority: "high", title: `Confirm scope on "${j.title}"`, subtitle: "Awaiting your sign-off", href: `/jobs/${j.id}` })
    );
    myJobs.filter((j) => j.status === "submitted").forEach((j) =>
      reminders.push({ priority: "high", title: `Review submitted work — "${j.title}"`, subtitle: "Accept or request a revision", href: `/jobs/${j.id}` })
    );
    proposalsOnMyJobs.filter((p) => p.status === "pending").slice(0, 4).forEach((p: any) =>
      reminders.push({
        priority: "medium",
        title: `New proposal from ${p.profiles?.full_name || "a creative"}`,
        subtitle: `Bid: ${formatMwk(p.bid_mwk)}`,
        href: `/jobs/${p.job_id}`,
      })
    );
  } else {
    acceptedJobs
      .filter((j: any) => j.status === "scope_pending" && !j.creative_confirmed_scope_at)
      .forEach((j: any) =>
        reminders.push({ priority: "high", title: `Confirm scope on "${j.title}"`, subtitle: "The client is waiting", href: `/jobs/${j.id}` })
      );
    acceptedJobs.filter((j: any) => j.status === "in_progress").forEach((j: any) =>
      reminders.push({ priority: "medium", title: `Submit work — "${j.title}"`, subtitle: "In progress", href: `/jobs/${j.id}` })
    );
    acceptedJobs.filter((j: any) => j.status === "revision_requested").forEach((j: any) =>
      reminders.push({ priority: "high", title: `Revision requested — "${j.title}"`, subtitle: "Re-submit when ready", href: `/jobs/${j.id}` })
    );
  }

  const navItems = [
    { href: "/dashboard", label: "Home" },
    { href: "/dashboard/jobs", label: "Jobs" },
    { href: "/dashboard/proposals", label: "Proposals" },
    { href: "/messages", label: "Messages" },
    ...(!isClient ? [{ href: "/dashboard/portfolio", label: "Portfolio" }, { href: "/dashboard/services", label: "Rate card" }] : []),
    { href: "/dashboard/saved", label: "Saved" },
    { href: "/dashboard/account", label: "Account" },
  ];

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 md:grid-cols-[180px_minmax(0,1fr)_280px] md:gap-10 md:py-10">
      <aside className="md:sticky md:top-20 md:self-start">
        <p className="eyebrow">Workspace</p>
        <nav className="mt-3 flex flex-col gap-1 text-sm">
          {navItems.map((n, i) => (
            <Link
              key={n.href}
              href={n.href}
              className={
                i === 0
                  ? "rounded-md bg-ink px-3 py-2 font-medium text-paper"
                  : "rounded-md px-3 py-2 text-ink/75 transition-colors hover:bg-wash/60 hover:text-ink"
              }
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="mt-6 border-t border-ink/15 pt-4">
          <Link href={`/creatives/${user.id}`} className="block text-sm text-ink/70 underline decoration-ink/30 underline-offset-4 hover:text-ink">
            View public profile →
          </Link>
        </div>
      </aside>

      <main className="space-y-6 min-w-0">
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
          {stats.map((s) => (
            <div key={s.label} className="card-soft p-6">
              <p className="text-xs uppercase tracking-wider text-ink/55">{s.label}</p>
              <p className={`mt-2 font-display text-2xl text-ink ${s.mono ? "tabular-nums" : ""}`}>{s.value}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-5 md:grid-cols-[1.5fr_1fr]">
          <BarChart title={isClient ? "Spend, last 6 months" : "Earned, last 6 months"} months={months} />
          <DonutChart title={isClient ? "Escrow status" : "Proposal outcomes"} donut={donut} />
        </section>

        <section className="card-soft overflow-hidden">
          <div className="flex items-center justify-between border-b border-ink/[0.06] px-6 py-4">
            <p className="font-display text-lg">Active jobs</p>
            <Link href="/dashboard/jobs" className="text-xs text-ink/65 underline decoration-ink/30 underline-offset-4 hover:text-ink">
              See all →
            </Link>
          </div>
          {projects.length === 0 ? (
            <p className="px-5 py-8 text-sm text-ink/55">
              No active jobs yet.{" "}
              <Link href={isClient ? "/jobs/new" : "/jobs"} className="text-stamp underline underline-offset-4">
                {isClient ? "Post a job" : "Find jobs"}
              </Link>
              .
            </p>
          ) : (
            <table className="w-full text-sm">
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
                      <Link href={`/jobs/${p.id}`} className="text-xs text-stamp underline underline-offset-4 hover:text-stamp-dark">
                        Open →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>

      <aside className="md:sticky md:top-20 md:self-start">
        <div className="flex items-center justify-between">
          <p className="eyebrow">Reminders</p>
          {reminders.length > 0 && (
            <span className="font-display text-xs italic text-stamp" style={{ fontStyle: "italic", fontVariationSettings: '"opsz" 144, "SOFT" 100, "WONK" 1' }}>
              {reminders.length}
            </span>
          )}
        </div>
        <div className="mt-3 space-y-2">
          {reminders.length === 0 && (
            <p className="rounded-lg border border-dashed border-ink/20 bg-paper p-4 text-xs text-ink/55">
              You're all caught up.
            </p>
          )}
          {reminders.slice(0, 6).map((r, i) => (
            <Link
              key={i}
              href={r.href}
              className="card-soft block p-4 transition hover:-translate-y-0.5"
            >
              <span
                className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                  r.priority === "high"
                    ? "bg-stamp/10 text-stamp"
                    : r.priority === "medium"
                    ? "bg-mark/10 text-mark"
                    : "bg-ink/10 text-ink/70"
                }`}
              >
                {r.priority}
              </span>
              <p className="mt-2 text-sm font-medium text-ink">{r.title}</p>
              <p className="mt-0.5 text-xs text-ink/60">{r.subtitle}</p>
            </Link>
          ))}
        </div>
      </aside>
    </div>
  );
}

function BarChart({ title, months }: { title: string; months: { label: string; value: number }[] }) {
  const max = Math.max(...months.map((m) => m.value), 1);
  const total = months.reduce((s, m) => s + m.value, 0);
  return (
    <div className="card-soft p-7">
      <div className="flex items-baseline justify-between">
        <p className="font-display text-lg">{title}</p>
        <p className="font-mono text-sm tabular-nums text-ink/70">{total ? `MWK ${total.toLocaleString()}` : "—"}</p>
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
              <circle
                key={i}
                cx="65"
                cy="65"
                r={R}
                fill="none"
                stroke={s.color}
                strokeWidth="14"
                strokeDasharray={dasharray}
                strokeDashoffset={dashoffset}
                transform="rotate(-90 65 65)"
              />
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
