import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { verifyPayment } from "@/lib/payments";
import { promotePendingAcceptance } from "@/lib/accept-pending";
import { logJobEvent } from "@/lib/job-events";

export const runtime = "nodejs";

function serviceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

// Browser-side redirect target. Whichever fires first (this or the webhook)
// settles the escrow state — both re-verify server-side, both idempotent.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const txRef = url.searchParams.get("tx_ref");
  const supabase = serviceClient();

  if (txRef && txRef.startsWith("ghtop_")) {
    const { data: topup } = await supabase.from("payment_topups")
      .select("id, job_id, amount_mwk, status, reason, requested_by_creative_id").eq("payment_ref", txRef).maybeSingle();
    if (topup && topup.status === "pending") {
      const verified = await verifyPayment(txRef);
      if (verified.status === "success") {
        // Atomic guard: only whichever of (callback, webhook) flips this
        // topup first fires the side effects.
        const { data: flipped } = await supabase.from("payment_topups").update({
          status: "paid",
          payment_provider_id: verified.providerId || null,
          responded_at: new Date().toISOString(),
        }).eq("id", topup.id).eq("status", "pending").select("id");
        if (flipped && flipped.length > 0) {
          await supabase.rpc("increment_total_paid", { p_job_id: topup.job_id, p_amount: topup.amount_mwk });
          // Session 4: revision-overage post-pay side effects.
          const reason = String(topup.reason || "");
          if (reason.startsWith("EXTRA_REVISION|")) {
            const note = reason.slice("EXTRA_REVISION|".length).trim() || null;
            const { data: jobRow } = await supabase.from("jobs")
              .select("id, client_id, revisions_included, revisions_used").eq("id", topup.job_id).maybeSingle();
            if (jobRow) {
              const nextUsed = Number(jobRow.revisions_used ?? 0) + 1;
              await supabase.from("jobs").update({ revisions_used: nextUsed }).eq("id", jobRow.id);
              await logJobEvent(jobRow.id, "revision_requested", note, {
                actorId: jobRow.client_id ?? null,
                metadata: { revision_number: nextUsed, of: jobRow.revisions_included, paid: true, topup_id: topup.id, amount_mwk: topup.amount_mwk },
              });
            }
          }
        }
      } else if (verified.status === "failed") {
        await supabase.from("payment_topups").update({
          status: "declined",
          responded_at: new Date().toISOString(),
        }).eq("id", topup.id);
      }
    }
    if (topup) return NextResponse.redirect(new URL(`/jobs/${topup.job_id}`, url.origin));
  }

  if (txRef) {
    const { data: job } = await supabase.from("jobs").select("id, escrow_status, client_id, title, accepted_bid_mwk").eq("payment_ref", txRef).maybeSingle();
    if (job && job.escrow_status === "payment_pending") {
      const verified = await verifyPayment(txRef);
      // Underpayment guard: don't hold escrow for less than the agreed bid.
      if (
        verified.status === "success" &&
        job.accepted_bid_mwk != null &&
        (verified.amount ?? 0) < job.accepted_bid_mwk
      ) {
        const { logAdminError } = await import("@/lib/admin-errors");
        await logAdminError({ operation: "payment_underpaid", jobId: job.id, error: "verified amount below accepted bid", context: { txRef, paid: verified.amount, expected: job.accepted_bid_mwk } });
        return NextResponse.redirect(new URL(`/jobs/${job.id}`, url.origin));
      }
      if (verified.status === "success") {
        // Atomic guard: only one of (callback, webhook) wins the transition.
        // Affected-rows tells us we won and lets us fire side effects once.
        const { data: flipped } = await supabase.from("jobs").update({
          escrow_status: "payment_held",
          payment_held_at: new Date().toISOString(),
          payment_provider_id: verified.providerId || null,
          collection_amount_mwk: verified.amount ?? null,
          collection_fee_mwk: verified.fee ?? null,
          payment_rail: verified.rail ?? null,
        }).eq("id", job.id).eq("escrow_status", "payment_pending").select("id");
        if (flipped && flipped.length > 0) {
          await logJobEvent(job.id, "escrow_funded", null, { actorId: job.client_id });
          await supabase.from("notifications").insert({
            user_id: job.client_id,
            kind: "escrow_funded",
            title: "Payment is safely in escrow",
            body: `Funds for "${job.title}" are held. The creative can begin work. You'll be able to release payment the next business day.`,
            link: `/jobs/${job.id}`,
            target_type: "job",
            target_id: job.id,
          });
        }
        await promotePendingAcceptance(supabase, job.id);
      } else if (verified.status === "failed") {
        await supabase.from("jobs").update({
          escrow_status: "none",
          pending_accept_proposal_id: null,
        }).eq("id", job.id);
        const { logAdminError } = await import("@/lib/admin-errors");
        await logAdminError({ operation: "payment_verify_failed", jobId: job.id, error: "PayChangu verify returned failed", context: { txRef } });
      }
    }
    if (job) return NextResponse.redirect(new URL(`/jobs/${job.id}`, url.origin));
  }
  return NextResponse.redirect(new URL("/dashboard", url.origin));
}
