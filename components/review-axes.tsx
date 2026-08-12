import { Label } from "@/components/ui/label";
import { StarRatingInput } from "@/components/star-rating-input";

/**
 * Item 29 (§N1) — multi-axis ratings.
 *
 * A bare 4.2 reads as ominous and tells the person rated nothing they can act
 * on. Three axes make the number legible and turn it into feedback.
 *
 * The two sets are not symmetrical, deliberately. §N1 argues the client axes
 * matter more in this market than the creative ones: a creative's real fear is
 * not a bad rating, it is a client who disappears after delivery or haggles
 * the price down after the fact. So "Paid on time" is a first-class axis.
 *
 * ponytail: three of the existing StarRatingInput, no new widget.
 */

const AXES = {
  // A client rating the creative they hired.
  creative: [
    { name: "rating_quality", label: "Quality of work", hint: "Was the work itself good?" },
    { name: "rating_communication", label: "Communication", hint: "Did they keep you informed?" },
    { name: "rating_deadline", label: "Met the deadline", hint: "Did it arrive when promised?" },
  ],
  // A creative rating the client who hired them.
  client: [
    { name: "rating_brief_clarity", label: "Clear brief", hint: "Did you know what was being asked?" },
    { name: "rating_paid_on_time", label: "Paid on time", hint: "Did the money arrive without chasing?" },
    { name: "rating_fair_revisions", label: "Fair on revisions", hint: "Reasonable about changes?" },
  ],
} as const;

export function ReviewAxes({ isClient }: { isClient: boolean }) {
  const axes = isClient ? AXES.creative : AXES.client;

  return (
    <div className="space-y-4 rounded-lg border border-ink/10 bg-wash/30 p-4">
      {axes.map((a) => (
        <div key={a.name} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5">
          <div className="min-w-0">
            <Label>{a.label}</Label>
            <p className="text-xs text-ink/55">{a.hint}</p>
          </div>
          <StarRatingInput name={a.name} />
        </div>
      ))}
      <p className="text-xs text-ink/45">Your overall star rating is the average of these three.</p>
    </div>
  );
}

/**
 * The read side: the axis breakdown under a review. Renders nothing when a
 * review predates the axes — old rows keep their single number rather than
 * showing three empty slots (§Q7).
 */
export function ReviewAxisBreakdown({ review }: { review: Record<string, unknown> }) {
  const all: { name: string; label: string }[] = [...AXES.creative, ...AXES.client];
  const present = all
    .map((a) => ({ label: a.label, value: review[a.name] as number | null }))
    .filter((a): a is { label: string; value: number } => typeof a.value === "number");

  if (!present.length) return null;

  return (
    <dl className="mt-2 flex flex-wrap gap-x-5 gap-y-1">
      {present.map((a) => (
        <div key={a.label} className="flex items-center gap-1.5 text-xs">
          <dt className="text-ink/55">{a.label}</dt>
          <dd className="font-medium text-ink/80">{a.value}/5</dd>
        </div>
      ))}
    </dl>
  );
}
