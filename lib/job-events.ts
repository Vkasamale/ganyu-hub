import { createServerClient } from "@supabase/ssr";

// The append-only job activity log. Writes bypass RLS via the service role
// because job_events has no client insert policy on purpose — nothing on the
// client should be able to forge a timeline entry. Session 1: only proof-of-
// concept caller is `promotePendingAcceptance` (proposal_accepted). Later
// sessions will fan more callers into this same helper.

// A runtime array, not a bare union, so a test can compare it against the SQL
// CHECK constraint in supabase/schema.sql. These were two hand-maintained
// copies of one list and they drifted: 'payment_released' was added here and
// never added there, so every insert violated the constraint — and logJobEvent
// swallows errors by design, so logging can never block a payout, which hid it
// in production. Keep this list and the constraint in step;
// tests/lib/job-event-types.test.ts fails loudly if they diverge again.
export const JOB_EVENT_TYPES = [
  "proposal_accepted",
  "escrow_funded",
  "work_started",
  "files_delivered",
  "revision_requested",
  "revision_delivered",
  "job_completed",
  "dispute_filed",
  "dispute_resolved",
  "cancelled",
  "deadline_extended",
  // The moment the creative actually gets paid. escrow_status records that
  // release happened but never when, and payment_held_at only marks the start
  // of the wait — so this event's created_at is the only record of how long a
  // creative waited. Forward-only: nothing can reconstruct it retroactively.
  "payment_released",
] as const;

export type JobEventType = (typeof JOB_EVENT_TYPES)[number];

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
