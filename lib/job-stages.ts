// Pure display layer over the existing job status + job_events log.
// No new statuses. Cancelled / disputed render as an overlay on the stage
// they happened at, not as their own stage.

export type StageKey =
  | "proposal_accepted"
  | "escrow_funded"
  | "in_progress"
  | "delivered"
  | "completed";

export const STAGES: { key: StageKey; label: string }[] = [
  { key: "proposal_accepted", label: "Proposal accepted" },
  { key: "escrow_funded", label: "Escrow funded" },
  { key: "in_progress", label: "In progress" },
  { key: "delivered", label: "Delivered" },
  { key: "completed", label: "Completed" },
];

export type JobStageInput = {
  status: string | null;
  escrow_status?: string | null;
};

export type JobEventLite = {
  event_type: string;
  created_at: string;
};

export type JobStageResult = {
  currentIdx: number;
  overlay: { kind: "cancelled" | "disputed"; stageIdx: number } | null;
};

function reachedIdxFromStatus(job: JobStageInput): number {
  const status = job.status || "";
  const escrow = job.escrow_status || "";
  if (status === "completed") return 4;
  if (status === "submitted" || status === "revision_requested") return 3;
  if (status === "in_progress") return 2;
  if (escrow === "payment_held" || escrow === "payment_released") return 1;
  if (status === "scope_pending" || status === "cancellation_requested" || status === "disputed") return 1;
  return 0;
}

function stageAtEventTime(events: JobEventLite[], targetCreatedAt: string): number {
  let reached = 0;
  for (const e of events) {
    if (e.created_at >= targetCreatedAt) break;
    switch (e.event_type) {
      case "proposal_accepted": reached = Math.max(reached, 0); break;
      case "escrow_funded": reached = Math.max(reached, 1); break;
      case "work_started": reached = Math.max(reached, 2); break;
      case "files_delivered":
      case "revision_delivered": reached = Math.max(reached, 3); break;
      case "job_completed": reached = Math.max(reached, 4); break;
    }
  }
  return reached;
}

export function computeJobStage(job: JobStageInput, events: JobEventLite[] = []): JobStageResult {
  const sorted = [...events].sort((a, b) => a.created_at.localeCompare(b.created_at));
  const currentIdx = reachedIdxFromStatus(job);

  const cancelEvent = sorted.find((e) => e.event_type === "cancelled");
  if (job.status === "cancelled" || cancelEvent) {
    const stageIdx = cancelEvent
      ? stageAtEventTime(sorted, cancelEvent.created_at)
      : currentIdx;
    return { currentIdx, overlay: { kind: "cancelled", stageIdx } };
  }

  const disputeFiled = [...sorted].reverse().find((e) => e.event_type === "dispute_filed");
  const disputeResolved = [...sorted].reverse().find((e) => e.event_type === "dispute_resolved");
  if (disputeFiled && (!disputeResolved || disputeResolved.created_at < disputeFiled.created_at)) {
    const stageIdx = stageAtEventTime(sorted, disputeFiled.created_at);
    return { currentIdx, overlay: { kind: "disputed", stageIdx } };
  }

  return { currentIdx, overlay: null };
}

// ponytail: self-check removed — file is now pulled into the client bundle by
// JobProgressBar, and the `require.main === module` idiom trips on `module`
// not being defined there. Behaviour tested in browser via job page.
