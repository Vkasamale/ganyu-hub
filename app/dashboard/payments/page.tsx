import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/supabase/user";
import { formatMwk, timeAgo } from "@/lib/utils";
import { getReleasedSpend } from "@/lib/money";
import { PeriodBarChart, OutcomeDonutChart } from "@/components/admin-charts";
import { PricingExplainer } from "@/components/pricing-explainer";

type Role = "client" | "creative" | "agency";

export default async function PaymentsPage() {
  const supabase = createClient();
  const user = await getSessionUser();
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
  const openAmount = rows
    .filter((r) => !r.escrow || r.escrow === "none")
    .reduce((s, r) => s + r.amount, 0);
  const disputedAmount = rows
    .filter((r) => r.escrow === "payment_disputed")
    .reduce((s, r) => s + r.amount, 0);

  // Last 6 months of released money, grouped by the row's created_at month.
  // Not a perfect proxy for "when funds cleared" (we don't track escrow-transition
  // timestamps yet) but close enough — most jobs release in the same month they open.
  const monthBuckets: { key: string; label: string; value: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    monthBuckets.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleDateString(undefined, { month: "short" }),
      value: 0,
    });
  }
  for (const r of rows) {
    if (r.escrow !== "payment_released") continue;
    const d = new Date(r.created_at);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const bucket = monthBuckets.find((b) => b.key === key);
    if (bucket) bucket.value += r.amount;
  }
  const trend = monthBuckets.map(({ label, value }) => ({ label, value }));

  // Donut of where money currently sits. Amber for held, teal for released,
  // grey for open/none, red for disputed.
  const donut = [
    { label: "In escrow", value: held, color: "hsl(35, 92%, 50%)" },
    { label: "Released", value: released, color: "hsl(180, 92%, 30%)" },
    { label: "Open", value: openAmount, color: "hsla(0, 14%, 17%, 0.25)" },
    { label: "Disputed", value: disputedAmount, color: "hsl(0, 70%, 45%)" },
  ].filter((d) => d.value > 0);
  const donutTotal = donut.reduce((s, d) => s + d.value, 0);

  // Client spend figures come from the single source of truth (lib/money.ts),
  // never from held+released — "released" must exclude money still in escrow.
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const releasedRecent = isClient ? await getReleasedSpend(user.id, sixMonthsAgo) : 0;
  const releasedLifetime = isClient ? await getReleasedSpend(user.id) : 0;

  // Item 25 (§L2): every money state carries a `?`. These tooltips matter more
  // for us than for the platforms we get compared to — we charge 2% + MWK 700
  // on bank payouts, hold funds until the next business day, and take a
  // separate collection fee on the way in. A number with no explanation lets
  // someone assume the worst about all three.
  const stats = isClient
    ? [
        {
          label: "In escrow",
          value: formatMwk(held),
          hint: "Money you have funded that has not been released yet. It is held for you, not spent, and does not reach the creative until you approve the work.",
        },
        {
          label: "Released",
          value: formatMwk(releasedRecent),
          hint: "Released to creatives in the last six months. Once released, funds cannot be pulled back.",
        },
        {
          label: "Lifetime released",
          value: formatMwk(releasedLifetime),
          hint: "Everything you have ever released, all time.",
        },
      ]
    : [
        {
          label: "Pending payout",
          value: formatMwk(held),
          hint: "Funded by the client and waiting on their approval. The money is already in escrow — this is not the client still owing it.",
        },
        {
          label: "Paid out",
          value: formatMwk(released),
          hint: "Released to you. Your payout provider may deduct a transfer charge — 2% on mobile money, plus a flat MWK 700 on bank transfers.",
        },
        {
          label: "Lifetime earned",
          value: formatMwk(lifetime),
          hint: "Everything released to you, plus everything currently in escrow for you, before payout charges.",
        },
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

      <PricingExplainer audience={isClient ? "client" : "creative"} />

      <div className="grid gap-3 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="card-soft p-5">
            <p className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-ink/55">
              {s.label}
              <span
                title={s.hint}
                aria-label={s.hint}
                className="inline-flex h-3.5 w-3.5 cursor-help items-center justify-center rounded-full border border-ink/20 text-[8px] font-semibold normal-case tracking-normal text-ink/50"
              >
                ?
              </span>
            </p>
            <p className="mt-1 text-2xl font-semibold text-ink tabular-nums">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_320px]">
        <section className="card-soft p-6">
          <div className="flex items-baseline justify-between">
            <p className="eyebrow">{isClient ? "Released spend" : "Payouts"} — last 6 months</p>
            <span className="text-xs text-ink/50">MWK</span>
          </div>
          <div className="mt-4">
            <PeriodBarChart data={trend} format="mwk" highlightLast seriesLabel={isClient ? "Spent" : "Earned"} />
          </div>
          {trend.every((t) => t.value === 0) && (
            <p className="mt-2 text-center text-xs text-ink/45">
              No released payments in the last 6 months yet.
            </p>
          )}
        </section>

        <section className="card-soft p-6">
          <p className="eyebrow">Where the money sits</p>
          <div className="mt-4">
            {donutTotal > 0 ? (
              <OutcomeDonutChart
                data={donut}
                centerValue={formatMwk(donutTotal)}
                centerLabel="Total"
              />
            ) : (
              <div className="flex h-[180px] items-center justify-center text-xs text-ink/45">
                Nothing tracked yet.
              </div>
            )}
          </div>
          <ul className="mt-4 space-y-1.5">
            {donut.map((d) => (
              <li key={d.label} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-ink/70">
                  <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />
                  {d.label}
                </span>
                <span className="tabular-nums text-ink">{formatMwk(d.value)}</span>
              </li>
            ))}
          </ul>
        </section>
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
      ? "bg-stamp/10 text-stamp-dark"
      : status === "payment_released"
      ? "bg-mark/10 text-mark"
      : "bg-ink/10 text-ink/60";
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${cls}`}>{label}</span>;
}
