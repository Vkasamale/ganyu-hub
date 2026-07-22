import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { verifyPayment } from "@/lib/payments";
import { promotePendingAcceptance } from "@/lib/accept-pending";

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
      .select("id, job_id, amount_mwk, status").eq("payment_ref", txRef).maybeSingle();
    if (topup && topup.status === "pending") {
      const verified = await verifyPayment(txRef);
      if (verified.status === "success") {
        await supabase.from("payment_topups").update({
          status: "paid",
          payment_provider_id: verified.providerId || null,
          responded_at: new Date().toISOString(),
        }).eq("id", topup.id);
        await supabase.rpc("increment_total_paid", { p_job_id: topup.job_id, p_amount: topup.amount_mwk });
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
    const { data: job } = await supabase.from("jobs").select("id, escrow_status, client_id, title").eq("payment_ref", txRef).maybeSingle();
    if (job && job.escrow_status === "payment_pending") {
      const verified = await verifyPayment(txRef);
      if (verified.status === "success") {
        await supabase.from("jobs").update({
          escrow_status: "payment_held",
          payment_held_at: new Date().toISOString(),
          payment_provider_id: verified.providerId || null,
          collection_amount_mwk: verified.amount ?? null,
          collection_fee_mwk: verified.fee ?? null,
          payment_rail: verified.rail ?? null,
        }).eq("id", job.id);
        await promotePendingAcceptance(supabase, job.id);
        // Whichever path fires first (callback vs webhook) inserts this; the
        // other's branch is guarded by escrow_status === "payment_pending", so
        // the second attempt skips the update AND this insert.
        await supabase.from("notifications").insert({
          user_id: job.client_id,
          kind: "escrow_funded",
          title: "Payment is safely in escrow",
          body: `Funds for "${job.title}" are held. The creative can begin work. You'll be able to release payment the next business day.`,
          link: `/jobs/${job.id}`,
          target_type: "job",
          target_id: job.id,
        });
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
