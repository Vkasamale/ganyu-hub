import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatMwk, timeAgo } from "@/lib/utils";

type Role = "client" | "creative" | "agency";

export default async function PaymentsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const role: Role = (profile?.role as Role) || "creative";
  const isClient = role === "client";

  type Row = { id: string; title: string; counterparty: string; amount: number; status: string; escrow: string | null; created_at: string };
  let rows: Row[] = [];

  if (isClient) {
    const { data } = await supabase
      .from("jobs")
      .select("id, title, budget_mwk, status, escrow_status, created_at")
      .eq("client_id", user.id)
      .order("created_at", { ascending: false });
    rows = (data || []).map((j: any) => ({
      id: j.id,
      title: j.title,
      counterparty: "",
      amount: j.budget_mwk || 0,
      status: j.status,
      escrow: j.escrow_status,
      created_at: j.created_at,
    }));
  } else {
    const { data } = await supabase
      .from("proposals")
      .select("id, bid_mwk, status, created_at, jobs:jobs!proposals_job_id_fkey(id, title, status, escrow_status, profiles:profiles!jobs_client_id_fkey(full_name))")
      .eq("creative_id", user.id)
      .eq("status", "accepted")
      .order("created_at", { ascending: false });
    rows = (data || []).map((p: any) => ({
      id: p.jobs?.id || p.id,
      title: p.jobs?.title || "Untitled",
      counterparty: p.jobs?.profiles?.full_name || "Client",
      amount: p.bid_mwk || 0,
      status: p.jobs?.status || "—",
      escrow: p.jobs?.escrow_status || null,
      created_at: p.created_at,
    }));
  }

  const held = rows.filter((r) => r.escrow === "payment_held").reduce((s, r) => s + r.amount, 0);
  const released = rows.filter((r) => r.escrow === "payment_released").reduce((s, r) => s + r.amount, 0);
  const lifetime = held + released;

  const stats = isClient
    ? [
        { label: "In escrow", value: formatMwk(held) },
        { label: "Released", value: formatMwk(released) },
        { label: "Lifetime spend", value: formatMwk(lifetime) },
      ]
    : [
        { label: "Pending payout", value: formatMwk(held) },
        { label: "Paid out", value: formatMwk(released) },
        { label: "Lifetime earned", value: formatMwk(lifetime) },
      ];

  return (
    <div className="space-y-8">
      <header>
        <p className="eyebrow">Money</p>
        <h1 className="mt-1 text-3xl font-semibold text-ink">Payments</h1>
        <p className="mt-1 text-sm text-ink/60">
          {isClient ? "Track escrow and what's been released to creatives." : "Track what's held in escrow and what's been paid out."}
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="card-soft p-5">
            <p className="text-[10px] font-medium uppercase tracking-wider text-ink/55">{s.label}</p>
            <p className="mt-1 text-2xl font-semibold text-ink tabular-nums">{s.value}</p>
          </div>
        ))}
      </div>

      <section className="card-soft p-6">
        <p className="eyebrow">Transactions</p>
        <div className="mt-4 space-y-2">
          {rows.length === 0 && (
            <p className="rounded-lg border border-dashed border-ink/20 p-6 text-center text-sm text-ink/55">
              No payments yet.
            </p>
          )}
          {rows.map((r) => (
            <Link
              key={r.id}
              href={`/jobs/${r.id}`}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-ink/10 bg-white p-3 transition hover:border-ink/25"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink">{r.title}</p>
                <p className="text-xs text-ink/55">
                  {r.counterparty && `${r.counterparty} · `}
                  {(r.status || "").replace("_", " ")} · {timeAgo(r.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <EscrowBadge status={r.escrow} />
                <span className="tabular-nums text-sm font-medium text-ink">{formatMwk(r.amount)}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function EscrowBadge({ status }: { status: string | null }) {
  if (!status) return <span className="text-[10px] uppercase tracking-wider text-ink/40">—</span>;
  const label = status.replace("payment_", "").replace("_", " ");
  const cls =
    status === "payment_held"
      ? "bg-stamp/10 text-stamp"
      : status === "payment_released"
      ? "bg-mark/10 text-mark"
      : "bg-ink/10 text-ink/60";
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${cls}`}>{label}</span>;
}
