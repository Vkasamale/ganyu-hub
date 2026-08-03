import { createServerClient } from "@supabase/ssr";

// The append-only job activity log. Writes bypass RLS via the service role
// because job_events has no client insert policy on purpose — nothing on the
// client should be able to forge a timeline entry. Session 1: only proof-of-
// concept caller is `promotePendingAcceptance` (proposal_accepted). Later
// sessions will fan more callers into this same helper.

export type JobEventType =
  | "proposal_accepted"
  | "escrow_funded"
  | "work_started"
  | "files_delivered"
  | "revision_requested"
  | "revision_delivered"
  | "job_completed"
  | "dispute_filed"
  | "dispute_resolved"
  | "cancelled"
  | "deadline_extended";

function serviceClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

export type LogJobEventOpts = {
  actorId?: string | null;
  metadata?: Record<string, unknown> | null;
};

export async function logJobEvent(
  jobId: string,
  eventType: JobEventType,
  note?: string | null,
  opts: LogJobEventOpts = {},
): Promise<void> {
  const admin = serviceClient();
  if (!admin) {
    console.error("[job-events] service role key missing, event dropped:", eventType, jobId);
    return;
  }
  const { error } = await admin.from("job_events").insert({
    job_id: jobId,
    event_type: eventType,
    actor_id: opts.actorId ?? null,
    note: note ?? null,
    metadata: opts.metadata ?? null,
  });
  if (error) {
    console.error("[job-events] insert failed:", error.message, { jobId, eventType });
  }
}
