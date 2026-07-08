import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { verifyPayment } from "@/lib/payments";

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
        }).eq("id", job.id);
      } else if (verified.status === "failed") {
        await supabase.from("jobs").update({ escrow_status: "none" }).eq("id", job.id);
      }
    }
    if (job) return NextResponse.redirect(new URL(`/jobs/${job.id}`, url.origin));
  }
  return NextResponse.redirect(new URL("/dashboard", url.origin));
}
