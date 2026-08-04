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

// ponytail: single self-check via `node --loader tsx lib/job-stages.ts` or
// during tsc. Trivial constants intentionally untested.
if (typeof require !== "undefined" && require.main === module) {
  const assert = (cond: unknown, msg: string) => { if (!cond) throw new Error("FAIL: " + msg); };

  const a = computeJobStage({ status: "scope_pending", escrow_status: "payment_held" }, []);
  assert(a.currentIdx === 1 && a.overlay === null, "escrow held → stage 1");

  const b = computeJobStage({ status: "completed", escrow_status: "payment_released" }, []);
  assert(b.currentIdx === 4 && b.overlay === null, "completed → stage 4");

  const events: JobEventLite[] = [
    { event_type: "proposal_accepted", created_at: "2026-01-01T00:00:00Z" },
    { event_type: "escrow_funded", created_at: "2026-01-01T01:00:00Z" },
    { event_type: "cancelled", created_at: "2026-01-01T02:00:00Z" },
  ];
  const c = computeJobStage({ status: "cancelled", escrow_status: "payment_released" }, events);
  assert(c.overlay?.kind === "cancelled" && c.overlay.stageIdx === 1, "cancel after escrow → overlay at 1");

  const events2: JobEventLite[] = [
    { event_type: "proposal_accepted", created_at: "2026-01-01T00:00:00Z" },
    { event_type: "escrow_funded", created_at: "2026-01-01T01:00:00Z" },
    { event_type: "work_started", created_at: "2026-01-01T02:00:00Z" },
    { event_type: "files_delivered", created_at: "2026-01-01T03:00:00Z" },
    { event_type: "dispute_filed", created_at: "2026-01-01T04:00:00Z" },
  ];
  const d = computeJobStage({ status: "disputed", escrow_status: "payment_disputed" }, events2);
  assert(d.overlay?.kind === "disputed" && d.overlay.stageIdx === 3, "dispute after delivery → overlay at 3");

  console.log("ok");
}
