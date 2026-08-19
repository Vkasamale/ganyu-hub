import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { timingSafeEqual } from "crypto";
import * as Sentry from "@sentry/nextjs";
import { logJobEvent } from "@/lib/job-events";

export const runtime = "nodejs";

// Constant-time bearer check so the secret can't be recovered by timing the
// response. timingSafeEqual throws on length mismatch, so gate on length first.
function bearerOk(header: string): boolean {
  const expected = `Bearer ${process.env.CRON_SECRET}`;
  const a = Buffer.from(header);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(req: Request) {
  const auth = req.headers.get("authorization") || "";
  if (!process.env.CRON_SECRET || !bearerOk(auth)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    // Sentry cron check-in. withMonitor stamps a start on entry and an ok/error
    // on exit, so Sentry alerts on a run that FAILS *and* on a run that never
    // happens — the second is the one nothing else here can see. A Vercel cron
    // that silently stops firing produces no error, no log and no request.
    //
    // The schedule is declared inline so it upserts the monitor on first run;
    // it must stay in step with vercel.json ("0 6 * * *"). checkinMargin is
    // generous because Vercel Hobby crons are best-effort, not to-the-minute —
    // a tighter margin would page us about Vercel's queue, not our job.
    return await Sentry.withMonitor("non-response-check", () => run(), {
      schedule: { type: "crontab", value: "0 6 * * *" },
      checkinMargin: 30,
      maxRuntime: 10,
      timezone: "Etc/UTC",
    });
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

    const { data: flipped } = await admin.from("jobs").update({
      status: "disputed",
      dispute_reason: `Auto-flagged: no delivery 72h past deadline (${job.deadline}).`,
      dispute_raised_at: new Date().toISOString(),
    }).eq("id", job.id).eq("status", "in_progress").select("id");

    // Guard on affected rows so a repeat cron run doesn't double-log.
    if (!flipped || flipped.length === 0) continue;

    await logJobEvent(job.id, "dispute_filed", `Auto-flagged: no delivery 72h past deadline (${job.deadline}).`, {
      actorId: null,
      metadata: { source: "cron_non_response", deadline: job.deadline },
    });

    await admin.from("payment_topups").update({
      status: "cancelled",
      responded_at: new Date().toISOString(),
    }).eq("job_id", job.id).eq("status", "pending");

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
