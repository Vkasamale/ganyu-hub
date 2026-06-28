import { Card, CardContent } from "@/components/ui/card";
import { SavingForm, SubmitButton } from "@/components/saving-form";
import { updateJobStatus } from "@/app/actions";

type Role = "client" | "creative";

const LABELS: Record<string, string> = {
  open: "Open",
  in_progress: "In progress",
  submitted: "Submitted for review",
  revision_requested: "Revision requested",
  completed: "Completed",
  disputed: "Disputed",
  cancelled: "Cancelled",
};

function actionsFor(status: string, role: Role): { next: string; label: string; variant?: "outline" }[] {
  if (role === "creative") {
    if (status === "in_progress") return [{ next: "submitted", label: "Mark as submitted" }, { next: "disputed", label: "Flag dispute", variant: "outline" }];
    if (status === "revision_requested") return [{ next: "submitted", label: "Re-submit work" }, { next: "disputed", label: "Flag dispute", variant: "outline" }];
    if (status === "submitted") return [{ next: "disputed", label: "Flag dispute", variant: "outline" }];
    return [];
  }
  if (status === "open") return [{ next: "cancelled", label: "Cancel job", variant: "outline" }];
  if (status === "submitted") return [
    { next: "completed", label: "Accept & mark complete" },
    { next: "revision_requested", label: "Request revision", variant: "outline" },
    { next: "disputed", label: "Flag dispute", variant: "outline" },
  ];
  if (status === "in_progress" || status === "revision_requested") return [{ next: "disputed", label: "Flag dispute", variant: "outline" }];
  return [];
}

export function JobStatusPanel({ jobId, status, role }: { jobId: string; status: string; role: Role }) {
  const actions = actionsFor(status, role);
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
