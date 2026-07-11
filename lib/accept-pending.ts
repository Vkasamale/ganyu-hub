// Promotes the pinned proposal on payment success. Idempotent — safe to call
// from the webhook, callback, and reconcile paths without a coordination check.
// Kept out of app/actions.ts because that file's "use server" exports are all
// RPC-callable, and this helper shouldn't be triggerable from the client.

type Admin = any;

export async function promotePendingAcceptance(admin: Admin, jobId: string) {
  const { data: job } = await admin.from("jobs")
    .select("id, pending_accept_proposal_id, status")
    .eq("id", jobId).maybeSingle();
  if (!job || !job.pending_accept_proposal_id) return;

  const pinnedId = job.pending_accept_proposal_id as string;

  await admin.from("proposals").update({ status: "accepted" }).eq("id", pinnedId);
  await admin.from("proposals").update({ status: "declined" })
    .eq("job_id", jobId).eq("status", "pending").neq("id", pinnedId);

  // Only flip job.status if it's still open — never demote a further-along state.
  await admin.from("jobs").update({
    status: "scope_pending",
    pending_accept_proposal_id: null,
  }).eq("id", jobId).eq("status", "open");
}
