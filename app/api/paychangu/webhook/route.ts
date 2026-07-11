import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { verifyWebhookSignature, parseWebhook, parsePayoutWebhook, verifyPayment, verifyPayout } from "@/lib/payments";

export const runtime = "nodejs";

function serviceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

export async function POST(req: Request) {
  const raw = await req.text();
  const sig = req.headers.get("signature") || req.headers.get("Signature");
  if (!verifyWebhookSignature(raw, sig)) {
    return NextResponse.json({ error: "bad signature" }, { status: 401 });
  }

  let payload: any;
  try { payload = JSON.parse(raw); } catch { return NextResponse.json({ ok: true }); }
  const supabase = serviceClient();

  // Payout webhook. Prefer matching by meta.job_id (we set that ourselves in
  // initiatePayout, so it's the sturdiest key); fall back to our charge_id.
  const po = parsePayoutWebhook(payload);
  if (po.jobId || po.chargeId) {
    let pj: any = null;
    if (po.jobId) {
      const { data } = await supabase.from("jobs")
        .select("id, escrow_status, payout_status, payout_method, payout_ref")
        .eq("id", po.jobId).maybeSingle();
      pj = data;
    }
    if (!pj && po.chargeId) {
      const { data } = await supabase.from("jobs")
        .select("id, escrow_status, payout_status, payout_method, payout_ref")
        .eq("payout_ref", po.chargeId).maybeSingle();
      pj = data;
    }
    if (pj && pj.escrow_status === "payment_held" && pj.payout_status === "pending") {
      const method = (pj.payout_method === "bank" ? "bank" : "mobile") as "mobile" | "bank";
      const chargeIdForVerify = pj.payout_ref || po.chargeId;
      const verified = chargeIdForVerify
        ? await verifyPayout(chargeIdForVerify, method)
        : { status: po.status, providerId: po.providerId };
      if (verified.status === "success") {
        await supabase.from("jobs").update({
          escrow_status: "payment_released",
          payout_status: null,
          payout_provider_id: verified.providerId || po.providerId || null,
        }).eq("id", pj.id);
      } else if (verified.status === "failed") {
        await supabase.from("jobs").update({
          payout_status: "failed",
          payout_error: "PayChangu reported failed payout.",
        }).eq("id", pj.id);
      }
      return NextResponse.json({ ok: true });
    }
  }

  // Collection webhook (tx_ref) — re-verify via /verify-payment.
  const { txRef } = parseWebhook(payload);
  if (!txRef) return NextResponse.json({ ok: true });
  const verified = await verifyPayment(txRef);
  const { data: job } = await supabase.from("jobs").select("id, escrow_status").eq("payment_ref", txRef).maybeSingle();
  if (!job) return NextResponse.json({ ok: true });

  if (verified.status === "success" && job.escrow_status === "payment_pending") {
    await supabase.from("jobs").update({
      escrow_status: "payment_held",
      payment_provider_id: verified.providerId || null,
    }).eq("id", job.id);
  } else if (verified.status === "failed" && job.escrow_status === "payment_pending") {
    await supabase.from("jobs").update({ escrow_status: "none" }).eq("id", job.id);
  }
  return NextResponse.json({ ok: true });
}
