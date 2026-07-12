import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const auth = req.headers.get("authorization") || "";
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    return await run();
  } catch (e: any) {
    const { logAdminError } = await import("@/lib/admin-errors");
    await logAdminError({ operation: "cron_non_response", error: e });
    return NextResponse.json({ error: "cron failed" }, { status: 500 });
  }
}

async function run(): Promise<Response> {

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "service key not set" }, { status: 500 });
  }
  const admin = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );

  const cutoffISO = new Date(Date.now() - 72 * 3600 * 1000).toISOString().slice(0, 10);

  const { data: jobs } = await admin
    .from("jobs")
    .select("id, title, client_id, deadline")
    .eq("status", "in_progress")
    .lt("deadline", cutoffISO);

  const flagged: string[] = [];
  for (const job of jobs || []) {
    const { data: pendingExt } = await admin
      .from("deadline_extensions")
      .select("id").eq("job_id", job.id).eq("status", "pending").maybeSingle();
    if (pendingExt) continue;

    const { data: accepted } = await admin
      .from("proposals").select("creative_id").eq("job_id", job.id).eq("status", "accepted").maybeSingle();

    await admin.from("jobs").update({
      status: "disputed",
      dispute_reason: `Auto-flagged: no delivery 72h past deadline (${job.deadline}).`,
      dispute_raised_at: new Date().toISOString(),
    }).eq("id", job.id).eq("status", "in_progress");

    for (const uid of [job.client_id, accepted?.creative_id].filter(Boolean)) {
      await admin.from("notifications").insert({
        user_id: uid,
        kind: "message_received",
        title: "Job auto-flagged for dispute",
        body: `"${job.title}" has been auto-flagged: no delivery 72h past deadline. Admin will review.`,
        link: `/jobs/${job.id}`,
        target_type: "job",
        target_id: job.id,
      });
    }
    flagged.push(job.id);
  }

  return NextResponse.json({ ok: true, flagged });
}
