import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { verifyWebhookSignature, parseWebhook, verifyPayment } from "@/lib/payments";

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
  const { txRef } = parseWebhook(payload);
  if (!txRef) return NextResponse.json({ ok: true });

  // Server-side re-verify. Never trust the webhook payload alone.
  const verified = await verifyPayment(txRef);

  const supabase = serviceClient();
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
