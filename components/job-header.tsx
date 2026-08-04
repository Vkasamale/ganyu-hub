import { formatMwk } from "@/lib/utils";
import { creativeGross, payoutFee } from "@/lib/fees";
import { computeJobStage, type JobEventLite, type JobStageInput } from "@/lib/job-stages";
import { JobProgressBar } from "@/components/job-progress-bar";

// Money-at-a-glance header. Escrow amount uses the same precedence as the rest
// of the app (total_paid_mwk ?? collection_amount_mwk ?? accepted_bid_mwk).
// Payout uses creativeGross() so BETA_ZERO_COMMISSION is respected. We don't
// know the payout rail here, so payout-rail fees are not subtracted — that
// happens at payout initiation, and the difference is small.
export type JobHeaderJob = JobStageInput & {
  title: string;
  category?: string | null;
  total_paid_mwk?: number | null;
  collection_amount_mwk?: number | null;
  accepted_bid_mwk?: number | null;
};

export function JobHeader({
  job,
  events = [],
  right,
}: {
  job: JobHeaderJob;
  events?: JobEventLite[];
  right?: React.ReactNode;
}) {
  const stage = computeJobStage(job, events);
  const escrow = job.total_paid_mwk ?? job.collection_amount_mwk ?? job.accepted_bid_mwk ?? 0;
  const gross = creativeGross(escrow);
  // Show the pessimistic net so the number doesn't shrink at cash-out. Whichever
  // rail costs more at this amount wins (bank's flat 700 dominates small payouts,
  // mobile's higher % dominates large ones).
  const worstFee = Math.max(payoutFee(gross, "bank"), payoutFee(gross, "mobile"));
  const payout = Math.max(0, gross - worstFee);

  return (
    <div className="rounded-lg border border-ink/10 bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h1 className="font-display text-2xl leading-tight sm:text-3xl">{job.title}</h1>
        {right && <div className="flex shrink-0 items-center gap-2">{right}</div>}
      </div>

      <div className="mt-4">
        <div className="text-xs uppercase tracking-wide text-ink/55">Money in escrow</div>
        <div className="mt-1 font-display text-3xl tabular-nums text-ink sm:text-4xl">
          {formatMwk(escrow)}
        </div>
        <div className="mt-1 text-sm text-ink/70">
          Creative receives (est., after cash-out fee):{" "}
          <span className="font-medium tabular-nums">{formatMwk(payout)}</span>
        </div>
      </div>

      <div className="mt-6">
        <JobProgressBar stage={stage} />
      </div>
    </div>
  );
}
