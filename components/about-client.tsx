import Link from "next/link";
import { formatMwk } from "@/lib/utils";
import { formatReplyTime, type ClientTrust } from "@/lib/client-trust";

/**
 * Item 24 (§G2) — "About the client" on job detail. The plan calls this the
 * biggest single gap in the product: it is the block that tells a creative
 * whether writing a proposal is worth their evening.
 *
 * Escrow *funded* is a stronger signal than Upwork's "payment method verified"
 * and we have had it all along — we just never showed it. So it leads.
 *
 * Every row is conditional. A client who has posted one job shows a short
 * block rather than a long one padded with dashes and zeroes (§Q7), and a
 * brand-new client shows the honest thing: that they are new.
 */
export function AboutClient({
  trust,
  clientId,
  clientName,
}: {
  trust: ClientTrust;
  clientId: string | null;
  clientName: string | null;
}) {
  const facts: { label: string; value: string; hint?: string }[] = [];

  // Item 31 (§G3) leads, above the activity numbers: what creatives who
  // actually worked for this client said. Reviews were always bidirectional in
  // the schema; this is the first place the client direction appears where the
  // decision to bid is made.
  if (trust.rating != null && trust.reviewCount > 0) {
    facts.push({
      label: "Rated by creatives",
      value: `${trust.rating.toFixed(1)} ★ · ${trust.reviewCount} review${trust.reviewCount === 1 ? "" : "s"}`,
      hint: "Ratings left by creatives who completed work for this client.",
    });
  }

  if (trust.jobsPosted > 0) {
    facts.push({
      label: "Jobs posted",
      value:
        trust.jobsOpen > 0 ? `${trust.jobsPosted} · ${trust.jobsOpen} open now` : String(trust.jobsPosted),
    });
  }
  if (trust.hireRate != null) {
    facts.push({
      label: "Hires someone",
      value: `${Math.round(trust.hireRate * 100)}% of the time`,
      hint: "Jobs where a proposal was accepted, out of all jobs this client has posted.",
    });
  }
  if (trust.totalSpentMwk > 0) {
    facts.push({
      label: "Paid through Ganyu Hub",
      value: formatMwk(trust.totalSpentMwk),
      hint: "Money this client has actually funded into escrow — not budgets they advertised.",
    });
  }
  if (trust.medianReplyMins != null) {
    facts.push({
      label: "Usually replies in",
      value: formatReplyTime(trust.medianReplyMins),
      hint: "Median time to answer a message. Half their replies are faster than this.",
    });
  }
  if (trust.memberSince) {
    facts.push({
      label: "Member since",
      value: new Date(trust.memberSince).toLocaleDateString("en-GB", { month: "long", year: "numeric" }),
    });
  }

  return (
    <section className="card-soft mt-6 p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="eyebrow">About the client</p>
        {clientId && (
          <Link href={`/clients/${clientId}`} className="text-xs font-medium text-brand-dark hover:underline">
            View profile
          </Link>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {trust.hasFundedEscrow ? (
          <Badge tone="strong" title="This client has funded escrow on a previous job — the money was really there.">
            ✓ Has funded escrow before
          </Badge>
        ) : (
          // Said plainly rather than hidden. A creative deciding whether to
          // spend an evening on a proposal is entitled to know this.
          <Badge tone="quiet" title="Nothing is wrong — they simply have not funded a job here yet.">
            New to Ganyu Hub
          </Badge>
        )}
        {trust.isRepeatClient && (
          <Badge tone="strong" title="Has hired the same creative on more than one job.">
            ✓ Hires people again
          </Badge>
        )}
        {/* Deliberately "on file", never "verified": there is no OTP flow in
            this product, so a verified badge would be a claim we cannot back. */}
        {trust.phoneOnFile && (
          <Badge tone="quiet" title="A phone number is on their profile. We have not verified it.">
            Phone on file
          </Badge>
        )}
      </div>

      {facts.length > 0 && (
        <dl className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
          {facts.map((f) => (
            <div key={f.label} className="flex items-baseline justify-between gap-3 border-b border-ink/[0.07] pb-2">
              <dt className="flex items-center gap-1 text-sm text-ink/60">
                {f.label}
                {f.hint && (
                  <span
                    title={f.hint}
                    aria-label={f.hint}
                    className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full border border-ink/20 text-[9px] font-semibold text-ink/50"
                  >
                    ?
                  </span>
                )}
              </dt>
              <dd className="text-right text-sm font-medium text-ink">{f.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {trust.jobsPosted <= 1 && !trust.hasFundedEscrow && (
        <p className="mt-3 text-xs text-ink/55">
          {clientName || "This client"} has not hired here yet. Escrow still protects you — no work
          starts until the money is in.
        </p>
      )}
    </section>
  );
}

function Badge({
  children,
  tone,
  title,
}: {
  children: React.ReactNode;
  tone: "strong" | "quiet";
  title: string;
}) {
  return (
    <span
      title={title}
      className={
        (tone === "strong"
          ? "border-stamp/30 bg-stamp/10 text-stamp-dark"
          : "border-ink/15 bg-ink/[0.03] text-ink/60") +
        " rounded-full border px-2.5 py-1 text-xs font-medium"
      }
    >
      {children}
    </span>
  );
}
