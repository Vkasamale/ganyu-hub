// Promotes the pinned proposal on payment success. Idempotent — safe to call
// from the webhook, callback, and reconcile paths without a coordination check.
// Kept out of app/actions.ts because that file's "use server" exports are all
// RPC-callable, and this helper shouldn't be triggerable from the client.

import { logJobEvent } from "@/lib/job-events";

type Admin = any;

export async function promotePendingAcceptance(admin: Admin, jobId: string) {
  const { data: job } = await admin.from("jobs")
    .select("id, pending_accept_proposal_id, status, client_id")
    .eq("id", jobId).maybeSingle();
  if (!job || !job.pending_accept_proposal_id) return;

  const pinnedId = job.pending_accept_proposal_id as string;

  await admin.from("proposals").update({ status: "accepted" }).eq("id", pinnedId);
  await admin.from("proposals").update({ status: "declined" })
    .eq("job_id", jobId).eq("status", "pending").neq("id", pinnedId);

  // Session 4: pull revision limits off the winning proposal and stamp the
  // job with them so the rest of the flow reads from the job row.
  const { data: pinnedProposal } = await admin.from("proposals")
    .select("revisions_offered, extra_revision_rate")
    .eq("id", pinnedId).maybeSingle();

  // Payment confirmed = scope agreement. Skip the scope_pending step entirely.
  // Only flip job.status if it's still open — never demote a further-along state.
  const { data: flipped } = await admin.from("jobs").update({
    status: "in_progress",
    pending_accept_proposal_id: null,
    payment_confirmed_at: new Date().toISOString(),
    revisions_included: pinnedProposal?.revisions_offered ?? null,
    extra_revision_rate: pinnedProposal?.extra_revision_rate ?? null,
  }).eq("id", jobId).eq("status", "open").select("id");

  // Only log on the true transition. `flipped` empty ⇒ another writer already
  // promoted this job (webhook + callback race) — skip the timeline write so
  // we don't get duplicate 'proposal_accepted' rows.
  if (flipped && flipped.length > 0) {
    await logJobEvent(jobId, "proposal_accepted", null, {
      actorId: job.client_id ?? null,
      metadata: { proposal_id: pinnedId },
    });
    // Payment-first acceptance skips scope_pending, so the job goes straight
    // to in_progress here — log that as work_started in the same guarded block.
    await logJobEvent(jobId, "work_started", null, {
      actorId: job.client_id ?? null,
    });
  }
}
