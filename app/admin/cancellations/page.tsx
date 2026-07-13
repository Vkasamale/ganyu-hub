import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SavingForm, SubmitButton } from "@/components/saving-form";
import { adminResolveCancellation, adminRejectCancellation } from "@/app/actions";
import { formatMwk } from "@/lib/utils";
import { formatSAST } from "@/lib/admin-format";
import { cancellationPayoutReserve, MIN_PAYOUT_MWK } from "@/lib/fees";

export default async function AdminCancellationsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: me } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  if (!me?.is_admin) redirect("/dashboard");

  const sp = await searchParams;
  const tab = sp?.tab === "history" ? "history" : "pending";

  const pendingRes = tab === "pending"
    ? await supabase
        .from("jobs")
        .select("id, title, status, accepted_bid_mwk, total_paid_mwk, collection_amount_mwk, cancellation_reason, cancellation_requested_by, cancellation_requested_at, payment_confirmed_at, deadline")
        .eq("status", "cancellation_requested")
        .order("cancellation_requested_at", { ascending: true })
    : { data: [] as any[] };

  const historyRes = tab === "history"
    ? await supabase
        .from("jobs")
        .select("id, title, status, total_paid_mwk, cancellation_reason, cancellation_requested_at, cancellation_resolved_by, client_refund_status, creative_cut_status")
        .eq("status", "cancelled")
        .not("cancellation_resolved_by", "is", null)
        .order("cancellation_requested_at", { ascending: false })
        .limit(50)
    : { data: [] as any[] };

  const jobs = pendingRes.data;
  const history = historyRes.data;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold text-ink">Cancellations</h1>
        <div className="flex gap-2">
          {[
            { key: "pending", label: "Pending queue", href: "/admin/cancellations" },
            { key: "history", label: "Resolved history", href: "/admin/cancellations?tab=history" },
          ].map((t) => {
            const active = tab === t.key;
            return (
              <Link
                key={t.key}
                href={t.href}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  active ? "border-ink bg-ink text-paper" : "border-ink/15 bg-white text-ink/70 hover:bg-ink/5"
                }`}
              >
                {t.label}
              </Link>
            );
          })}
        </div>
      </div>

      {tab === "history" && (
        <div className="space-y-3">
          {(!history || history.length === 0) && (
            <p className="rounded-lg border border-dashed border-ink/15 bg-paper p-6 text-center text-sm text-ink/55">
              No resolved cancellations yet.
            </p>
          )}
          {(history || []).map((j: any) => (
            <div key={j.id} className="rounded-lg border border-ink/10 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link href={`/jobs/${j.id}`} className="font-medium text-ink hover:underline break-words">{j.title}</Link>
                  <p className="mt-0.5 text-xs text-ink/55">
                    Requested {formatSAST(j.cancellation_requested_at)} · gross {formatMwk(j.total_paid_mwk || 0)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  <span className={`rounded-full px-2 py-0.5 ${j.client_refund_status === "success" ? "bg-emerald-100 text-emerald-900" : j.client_refund_status === "failed" ? "bg-red-100 text-red-900" : "bg-ink/10 text-ink/70"}`}>
                    refund: {j.client_refund_status || "—"}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 ${j.creative_cut_status === "success" ? "bg-emerald-100 text-emerald-900" : j.creative_cut_status === "failed" ? "bg-red-100 text-red-900" : "bg-ink/10 text-ink/70"}`}>
                    cut: {j.creative_cut_status || "—"}
                  </span>
                </div>
              </div>
              {j.cancellation_reason && (
                <p className="mt-2 line-clamp-2 whitespace-pre-wrap text-xs text-ink/70">{j.cancellation_reason}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === "pending" && (!jobs || jobs.length === 0) && (
        <p className="rounded-lg border border-dashed border-ink/15 bg-paper p-6 text-center text-sm text-ink/55">
          No pending cancellations.
        </p>
      )}
      {tab === "pending" && (jobs || []).map((job: any) => {
        // ponytail: match adminResolveCancellation's precedence — total_paid_mwk
        // includes paid top-ups, collection_amount_mwk is the original charge only.
        const gross = job.total_paid_mwk || job.collection_amount_mwk || job.accepted_bid_mwk || 0;
        const hasTopup = (job.total_paid_mwk || 0) > (job.accepted_bid_mwk || 0);
        const phase = suggestPhase(job);
        const suggestion = suggestSplit(phase);
        return (
          <Card key={job.id}>
            <CardHeader>
              <CardTitle>
                <Link href={`/jobs/${job.id}`} className="hover:underline">{job.title}</Link>
              </CardTitle>
              <p className="text-xs text-neutral-500">
                Requested {job.cancellation_requested_at} · phase {phase} · gross {formatMwk(gross)}
                {hasTopup && ` (original ${formatMwk(job.accepted_bid_mwk)} + top-ups ${formatMwk(gross - job.accepted_bid_mwk)})`}
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-md border border-ink/15 bg-paper p-3 text-sm">
                <p className="font-medium">Reason</p>
                <p className="mt-1 whitespace-pre-wrap text-ink/80">{job.cancellation_reason}</p>
              </div>
              {(() => {
                const clientShare = Math.floor(gross * suggestion.client / 100);
                const creativeShare = Math.floor(gross * suggestion.creative / 100);
                const clientReserve = cancellationPayoutReserve(clientShare);
                const creativeReserve = cancellationPayoutReserve(creativeShare);
                const clientAfter = Math.max(0, clientShare - clientReserve);
                const creativeAfter = Math.max(0, creativeShare - creativeReserve);
                const clientPayout = clientAfter >= MIN_PAYOUT_MWK ? clientAfter : 0;
                const creativePayout = creativeAfter >= MIN_PAYOUT_MWK ? creativeAfter : 0;
                const clientRolled = clientShare > 0 && clientPayout === 0;
                const creativeRolled = creativeShare > 0 && creativePayout === 0;
                const platform = gross - clientPayout - creativePayout;
                return (
                  <div className="rounded-md bg-ink/5 p-3 text-sm space-y-1">
                    <p className="font-medium">Suggested split ({phase})</p>
                    <p>
                      Client refund: {suggestion.client}% = {formatMwk(clientShare)} → payout {formatMwk(clientPayout)}
                      {clientRolled ? " (below MWK 1,000 floor — rolled to platform)" : ` (−${formatMwk(clientReserve)} fee reserve)`}
                    </p>
                    <p>
                      Creative cut: {suggestion.creative}% = {formatMwk(creativeShare)} → payout {formatMwk(creativePayout)}
                      {creativeRolled ? " (below MWK 1,000 floor — rolled to platform)" : ` (−${formatMwk(creativeReserve)} fee reserve)`}
                    </p>
                    <p>Platform net: {formatMwk(platform)} ({100 - suggestion.client - suggestion.creative}% + fee reserves{(clientRolled || creativeRolled) ? " + rolled shares" : ""})</p>
                    {(clientRolled || creativeRolled) && (
                      <p className="mt-2 rounded border border-amber-300 bg-amber-50 px-2 py-1 text-xs text-amber-900">
                        ⚠ {clientRolled && creativeRolled ? "Both sides are" : (clientRolled ? "Client refund is" : "Creative cut is")} under the MWK {MIN_PAYOUT_MWK.toLocaleString()} payout floor — PayChangu's transfer fee would eat it. Money stays on the platform. Adjust the split if you want an actual payout.
                      </p>
                    )}
                  </div>
                );
              })()}
              <SavingForm action={adminResolveCancellation} successText="Cancellation resolved." className="space-y-2">
                <input type="hidden" name="job_id" value={job.id} />
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <label className="text-xs text-ink/70">
                    Client % <Input name="client_pct" type="number" min={0} max={100} defaultValue={suggestion.client} required />
                  </label>
                  <label className="text-xs text-ink/70">
                    Creative % <Input name="creative_pct" type="number" min={0} max={100} defaultValue={suggestion.creative} required />
                  </label>
                  <label className="text-xs text-ink/70">
                    Type job title to confirm
                    <Input name="title_confirm" placeholder={job.title} required />
                  </label>
                </div>
                <SubmitButton pendingText="Resolving…">Resolve & execute payouts</SubmitButton>
              </SavingForm>
              <SavingForm action={adminRejectCancellation} successText="Cancellation rejected.">
                <input type="hidden" name="job_id" value={job.id} />
                <input type="hidden" name="revert_to" value="in_progress" />
                <Button size="sm" variant="outline" type="submit">Reject — revert to in_progress</Button>
              </SavingForm>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function suggestPhase(job: any): "A_early" | "A_late" | "B" | "C" {
  if (job.payment_confirmed_at) {
    const hoursSince = (Date.now() - new Date(job.payment_confirmed_at).getTime()) / 36e5;
    if (hoursSince < 24) return "A_early";
  }
  return "A_late";
}

function suggestSplit(phase: "A_early" | "A_late" | "B" | "C") {
  switch (phase) {
    case "A_early": return { client: 85, creative: 5 };
    case "A_late":  return { client: 50, creative: 35 };
    case "B":       return { client: 15, creative: 70 };
    case "C":       return { client: 30, creative: 55 };
  }
}
