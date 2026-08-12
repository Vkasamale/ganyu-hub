"use client";

import { useRef, useState } from "react";
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

/**
 * The review posts ITSELF once all three axes are rated — no Submit button.
 *
 * Why: people assume clicking a star saved it. That assumption is reasonable
 * and near-universal, and the cost of it being wrong is a review that never
 * gets written, on a marketplace whose whole trust model depends on reviews
 * existing.
 *
 * Why all three rather than the first click: a review is public, permanent and
 * attached to a named person, and there is no edit path. Posting on the first
 * tap would let one stray touch publish a one-star verdict, and would score the
 * overall on a single axis instead of three. Three deliberate taps is a clear
 * intention; one is not.
 *
 * The comment box therefore sits ABOVE the stars and says so — by the time the
 * third star is tapped, the review is gone.
 */
export function ReviewAxes({ isClient }: { isClient: boolean }) {
  const axes = isClient ? AXES.creative : AXES.client;
  const [rated, setRated] = useState<Record<string, number>>({});
  const [posting, setPosting] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const count = Object.keys(rated).length;

  function handleRate(name: string, value: number) {
    const next = { ...rated, [name]: value };
    setRated(next);
    if (Object.keys(next).length < axes.length || posting) return;
    // All three in. Post it. requestSubmit() runs the form's normal validation
    // and the same server action the old button called.
    setPosting(true);
    wrapRef.current?.closest("form")?.requestSubmit();
  }

  return (
    <div ref={wrapRef} className="space-y-4 rounded-lg border border-ink/10 bg-wash/30 p-4">
      {axes.map((a) => (
        <div key={a.name} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5">
          <div className="min-w-0">
            <Label>{a.label}</Label>
            <p className="text-xs text-ink/55">{a.hint}</p>
          </div>
          <StarRatingInput name={a.name} onChange={(v) => handleRate(a.name, v)} />
        </div>
      ))}

      <p className={"text-xs " + (posting ? "font-medium text-brand-dark" : "text-ink/55")}>
        {posting
          ? "Posting your review…"
          : count === 0
            ? `Rate all ${axes.length} and your review posts automatically. Write your comment first.`
            : `${count} of ${axes.length} rated — your review posts as soon as the last one is set.`}
      </p>
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
