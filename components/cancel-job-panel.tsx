"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SavingForm, SubmitButton } from "@/components/saving-form";
import { requestCancellation } from "@/app/actions";

export function CancelJobPanel({ jobId }: { jobId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const ready = reason.trim().length >= 30;

  if (!open) {
    return (
      <Button size="sm" variant="outline" type="button" onClick={() => setOpen(true)}>
        Cancel job
      </Button>
    );
  }

  return (
    <div className="w-full rounded-lg border border-amber-300 bg-amber-50 p-4 space-y-3">
      <p className="text-sm font-medium text-amber-900">Cancel this job</p>
      <p className="text-xs text-amber-900/80">
        This routes to an admin who reviews the reason and settles the split (refund to you, cut to the creative). Payouts execute after admin approval. This can't be undone once admin resolves.
      </p>
      <SavingForm action={requestCancellation} successText="Cancellation requested. Admin will review.">
        <input type="hidden" name="job_id" value={jobId} />
        <Textarea
          name="reason"
          rows={4}
          minLength={30}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Why are you cancelling? Be specific — this is what the admin uses to decide the split. Minimum 30 characters."
          className="bg-white"
        />
        <p className="text-xs text-amber-900/70 mt-1">
          {reason.trim().length}/30 minimum
        </p>
        <div className="flex gap-2 mt-3">
          <SubmitButton pendingText="Requesting…" disabled={!ready}>Request cancellation</SubmitButton>
          <Button size="sm" variant="outline" type="button" onClick={() => { setOpen(false); setReason(""); }}>Not yet</Button>
        </div>
      </SavingForm>
    </div>
  );
}
