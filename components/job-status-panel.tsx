import { Card, CardContent } from "@/components/ui/card";
import { SavingForm, SubmitButton } from "@/components/saving-form";
import { updateJobStatus } from "@/app/actions";

type Role = "client" | "creative";

const LABELS: Record<string, string> = {
  open: "Open",
  scope_pending: "Awaiting scope confirmation",
  in_progress: "In progress",
  submitted: "Submitted for review",
  revision_requested: "Revision requested",
  completed: "Completed",
  disputed: "Disputed",
  cancelled: "Cancelled",
};

function actionsFor(status: string, role: Role, escrowStatus?: string | null): { next: string; label: string; variant?: "outline" }[] {
  if (role === "creative") {
    // Closing is the creative's call, and only after the client has released —
    // CREATIVE_TRANSITIONS in app/actions.ts enforces the same gate server-side.
    // No "Mark as submitted" here: sending work through Send work for review is
    // what submits it. Two buttons for one act just stranded the job on
    // "in progress" when the creative used the obvious one.
    const canClose = escrowStatus === "payment_released" && status !== "completed";
    return canClose ? [{ next: "completed", label: "Close job", variant: "outline" as const }] : [];
  }
  if (status === "open") return [{ next: "cancelled", label: "Cancel job", variant: "outline" }];
  if (status === "scope_pending") return [{ next: "cancelled", label: "Cancel job", variant: "outline" }];
  if (status === "submitted") return [
    { next: "completed", label: "Accept & mark complete" },
    { next: "revision_requested", label: "Request revision", variant: "outline" },
  ];
  return [];
}

export function JobStatusPanel({ jobId, status, role, escrowStatus }: { jobId: string; status: string; role: Role; escrowStatus?: string | null }) {
  const actions = actionsFor(status, role, escrowStatus);
  if (actions.length === 0) return null;

  return (
    <Card className="mt-6">
      <CardContent className="p-5">
        <p className="text-sm text-neutral-500">Current status</p>
        <p className="font-semibold">{LABELS[status] || status}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {actions.map((a) => (
            <SavingForm key={a.next} action={updateJobStatus} successText={`Updated to ${a.next.replace("_", " ")}.`}>
              <input type="hidden" name="job_id" value={jobId} />
              <input type="hidden" name="status" value={a.next} />
              <SubmitButton size="sm" variant={a.variant} pendingText="Saving…">{a.label}</SubmitButton>
            </SavingForm>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
