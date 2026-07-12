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

  if (txRef) {
    const { data: job } = await supabase.from("jobs").select("id, escrow_status").eq("payment_ref", txRef).maybeSingle();
    if (job && job.escrow_status === "payment_pending") {
      const verified = await verifyPayment(txRef);
      if (verified.status === "success") {
        await supabase.from("jobs").update({
          escrow_status: "payment_held",
          payment_provider_id: verified.providerId || null,
          collection_amount_mwk: verified.amount ?? null,
          collection_fee_mwk: verified.fee ?? null,
          payment_rail: verified.rail ?? null,
        }).eq("id", job.id);
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
