"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SavingForm, SubmitButton } from "@/components/saving-form";
import { Reveal } from "@/components/animated";
import { raiseDispute } from "@/app/actions";

const DISPUTABLE = new Set(["scope_pending", "in_progress", "submitted", "revision_requested"]);

export function DisputePanel({ jobId, status }: { jobId: string; status: string }) {
  const [open, setOpen] = useState(false);
  if (!DISPUTABLE.has(status)) return null;

  // Sits in the same action row as "Propose deadline extension" and "Cancel
  // job". A standing card for a thing that usually never happens was shouting.
  if (!open) {
    return (
      <Button size="sm" variant="outline" type="button" onClick={() => setOpen(true)}>
        Something gone wrong?
      </Button>
    );
  }

  return (
    <div className="w-full rounded-lg border border-red-200 bg-red-50/40 p-4">
      <div>
        <p className="text-sm font-semibold text-red-900">Something gone wrong?</p>
        <p className="mt-1 text-sm text-ink/65">
          Flag a dispute and an admin will step in. Both sides and the admin team are notified.
        </p>
        <Reveal open={open}>
          <SavingForm action={raiseDispute} successText="Dispute raised. An admin will review." className="mt-4">
            <input type="hidden" name="job_id" value={jobId} />
            <label className="block text-sm font-medium">What happened?</label>
            <textarea
              name="reason"
              rows={4}
              minLength={10}
              required
              placeholder="Explain the issue clearly. The other party and the admin team will see this."
              className="mt-1 w-full rounded-md border border-ink/10 bg-white px-3 py-2 text-sm"
            />
            <div className="mt-3 flex gap-2">
              <SubmitButton size="sm" variant="outline" pendingText="Submitting…">Submit dispute</SubmitButton>
              <Button size="sm" variant="outline" type="button" onClick={() => setOpen(false)}>Cancel</Button>
            </div>
          </SavingForm>
        </Reveal>
      </div>
    </div>
  );
}

export function DisputeBanner({ reason, raisedByName }: { reason: string | null; raisedByName?: string | null }) {
  if (!reason) return null;
  return (
    <Card className="mt-6 border-red-300 bg-red-50">
      <CardContent className="p-5">
        <p className="text-sm font-semibold text-red-900">Dispute under review</p>
        <p className="mt-1 text-xs text-ink/65">
          Raised by {raisedByName || "a party to this job"}. An admin will resolve it.
        </p>
        <p className="mt-3 whitespace-pre-wrap rounded-md border border-red-200 bg-white px-3 py-2 text-sm text-ink/90">
          {reason}
        </p>
      </CardContent>
    </Card>
  );
}
