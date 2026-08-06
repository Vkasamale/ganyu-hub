"use client";

import { useState, useTransition } from "react";
import { requestRevision } from "@/app/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { formatMwk } from "@/lib/utils";
import { toast } from "sonner";

// Session 4: client asks for a revision. Three branches driven by the
// server action's response:
//   - ok:     within the included limit, logged as free
//   - error:  starts with "PAID_REVISION_REQUIRED:<rate>" — show the confirm
//             UI, then re-submit with confirm_paid=true to trigger the
//             top-up escrow flow (redirects to processor checkout)
//   - error:  anything else — a real error, surface as toast

export function RequestRevisionPanel({
  jobId,
  revisionsIncluded,
  revisionsUsed,
  extraRate,
}: {
  jobId: string;
  revisionsIncluded: number | null | undefined;
  revisionsUsed: number;
  extraRate: number | null | undefined;
}) {
  const [note, setNote] = useState("");
  const [pendingRate, setPendingRate] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();

  const included = revisionsIncluded ?? 0;
  const remaining = Math.max(0, included - revisionsUsed);
  const willBeOverage = revisionsUsed >= included;
  // Extras are purchased beyond the included allowance. Counting them into the
  // "x of y" reads as broken ("2 of 1"), so they're stated separately.
  const extra = Math.max(0, revisionsUsed - included);

  function submit(confirmPaid: boolean) {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("job_id", jobId);
      fd.set("note", note);
      if (confirmPaid) fd.set("confirm_paid", "true");
      const res = await requestRevision(fd);
      if (res?.ok) {
        toast.success(res.info ?? "Revision requested.");
        setNote("");
        setPendingRate(null);
        return;
      }
      const err = res?.error ?? "Something went wrong.";
      if (err.startsWith("PAID_REVISION_REQUIRED:")) {
        const rate = Number(err.split(":")[1]);
        setPendingRate(Number.isFinite(rate) ? rate : null);
        return;
      }
      toast.error(err);
    });
  }

  return (
    <Card className="mt-6">
      <CardContent className="p-5">
        <p className="text-sm font-medium text-ink">Request changes</p>
        <p className="mt-1 text-xs text-ink/60">
          {included > 0 ? (
            <>
              {Math.min(revisionsUsed, included)} of {included} included used
              {remaining > 0 ? ` — ${remaining} still included.` : "."}
              {extra > 0 && (
                <span className="ml-1 font-medium text-stamp-dark">
                  +{extra} extra revision{extra === 1 ? "" : "s"} purchased.
                </span>
              )}
            </>
          ) : (
            "No revisions were included in the accepted proposal."
          )}
        </p>

        {pendingRate == null ? (
          <div className="mt-4 space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="revision_note">What needs changing? (optional)</Label>
              <Textarea
                id="revision_note"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Point the creative at the specific bit — quicker turnaround."
              />
            </div>
            <Button
              type="button"
              onClick={() => submit(false)}
              disabled={pending}
            >
              {pending ? "Sending…" : willBeOverage && extraRate ? "Request extra revision" : "Request changes"}
            </Button>
            {willBeOverage && extraRate && (
              <p className="text-xs text-ink/60">
                Included revisions used. Requesting more will cost {formatMwk(extraRate)}.
              </p>
            )}
            {willBeOverage && !extraRate && (
              <p className="text-xs text-ink/60">
                Included revisions used. The creative didn&apos;t offer paid extras on this job.
              </p>
            )}
          </div>
        ) : (
          <div className="mt-4 space-y-3 rounded-md border border-amber-300 bg-amber-50 p-3">
            <p className="text-sm text-amber-900">
              You&apos;ve used your included revisions. An additional revision costs{" "}
              <strong>{formatMwk(pendingRate)}</strong>, agreed by the creative. Proceed?
            </p>
            <p className="text-xs text-amber-800">
              You&apos;ll be redirected to our secure checkout. The revision only counts once payment clears.
            </p>
            <div className="flex gap-2">
              <Button type="button" onClick={() => submit(true)} disabled={pending}>
                {pending ? "Starting checkout…" : `Pay ${formatMwk(pendingRate)} & continue`}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setPendingRate(null)}
                disabled={pending}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
