"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SavingForm, SubmitButton } from "@/components/saving-form";
import { proposeDeadlineExtension, respondToDeadlineExtension } from "@/app/actions";

type Pending = {
  id: string;
  proposed_by: string;
  proposed_deadline: string;
  reason: string | null;
};

export function DeadlineExtensionPanel({
  jobId,
  currentDeadline,
  pending,
  currentUserId,
}: {
  jobId: string;
  currentDeadline: string | null;
  pending: Pending | null;
  currentUserId: string;
}) {
  const [proposing, setProposing] = useState(false);

  if (pending) {
    const iProposed = pending.proposed_by === currentUserId;
    return (
      <div className="rounded-lg border border-ink/15 bg-paper p-4 space-y-2">
        <p className="text-sm font-medium">Deadline extension proposed</p>
        <p className="text-sm text-ink/80">
          New deadline: <span className="font-medium">{pending.proposed_deadline}</span>
          {currentDeadline && <span className="text-ink/60"> (was {currentDeadline})</span>}
        </p>
        {pending.reason && <p className="text-xs text-ink/70">Reason: {pending.reason}</p>}
        {iProposed ? (
          <p className="text-xs text-ink/60">Waiting for the other party to approve or decline.</p>
        ) : (
          <div className="flex gap-2 pt-1">
            <SavingForm action={respondToDeadlineExtension} successText="Extension approved.">
              <input type="hidden" name="extension_id" value={pending.id} />
              <input type="hidden" name="approve" value="true" />
              <SubmitButton pendingText="Approving…">Approve</SubmitButton>
            </SavingForm>
            <SavingForm action={respondToDeadlineExtension} successText="Extension declined.">
              <input type="hidden" name="extension_id" value={pending.id} />
              <input type="hidden" name="approve" value="false" />
              <Button size="sm" variant="outline" type="submit">Decline</Button>
            </SavingForm>
          </div>
        )}
      </div>
    );
  }

  if (!proposing) {
    return (
      <Button size="sm" variant="outline" type="button" onClick={() => setProposing(true)}>
        Propose deadline extension
      </Button>
    );
  }

  return (
    <div className="rounded-lg border border-ink/15 bg-paper p-4 space-y-3">
      <p className="text-sm font-medium">Propose a new deadline</p>
      <SavingForm action={proposeDeadlineExtension} successText="Proposal sent.">
        <input type="hidden" name="job_id" value={jobId} />
        <div className="space-y-1.5">
          <label className="text-xs text-ink/70">New deadline</label>
          <Input name="proposed_deadline" type="date" required />
        </div>
        <div className="space-y-1.5 mt-3">
          <label className="text-xs text-ink/70">Reason (optional)</label>
          <Textarea name="reason" rows={2} placeholder="Why the extension?" />
        </div>
        <div className="flex gap-2 mt-3">
          <SubmitButton pendingText="Sending…">Send proposal</SubmitButton>
          <Button size="sm" variant="outline" type="button" onClick={() => setProposing(false)}>Cancel</Button>
        </div>
      </SavingForm>
    </div>
  );
}
