import { BETA_ZERO_COMMISSION, PLATFORM_COMMISSION, PAYOUT_RATE } from "@/lib/fees";

// Reusable "How the money works" panel. Native <details> so it's zero-JS and
// works before hydration. Drop it on the job-post, proposal, and payments pages.
// Numbers come from lib/fees.ts (single source of truth) so it never drifts.
export function PricingExplainer({ audience = "both" }: { audience?: "client" | "creative" | "both" }) {
  const commissionLine = BETA_ZERO_COMMISSION
    ? "During beta, Ganyu Hub takes no commission — the creative keeps the full agreed price."
    : `Ganyu Hub keeps a ${Math.round(PLATFORM_COMMISSION * 100)}% platform commission from the agreed price.`;

  return (
    <details className="rounded-xl border border-ink/10 bg-wash/30 px-4 py-3 text-sm text-ink/80">
      <summary className="cursor-pointer list-none font-medium text-ink marker:content-none">
        <span className="inline-flex items-center gap-2">
          <span aria-hidden>💡</span> How the money works
          <span className="text-xs font-normal text-ink/50">(tap to expand)</span>
        </span>
      </summary>
      <div className="mt-3 space-y-3 break-words">
        <ol className="space-y-2">
          <li>
            <span className="font-medium text-ink">1. Agree a price.</span> The creative&apos;s bid is the
            price for the work.
          </li>
          {audience !== "creative" && (
            <li>
              <span className="font-medium text-ink">2. Client pays into escrow.</span> The client pays the
              agreed price plus a small mobile-money/card processing fee (~3%). The money is
              <span className="font-medium"> held safely</span> — the creative can&apos;t touch it yet.
            </li>
          )}
          <li>
            <span className="font-medium text-ink">{audience !== "creative" ? "3" : "2"}. Work happens.</span>{" "}
            The creative delivers; the client reviews and approves.
          </li>
          <li>
            <span className="font-medium text-ink">{audience !== "creative" ? "4" : "3"}. Payout.</span>{" "}
            On approval, escrow is released to the creative. {commissionLine} A payout fee of{" "}
            {Math.round(PAYOUT_RATE * 100)}% is taken by the mobile-money/bank provider on the
            transfer out (bank transfers add a flat MWK 700).
          </li>
        </ol>
        <p className="text-xs text-ink/55">
          Every figure you see on the platform (what the client pays, what the creative receives) already
          includes these fees, so there are no surprises at checkout.
        </p>
        <a href="/how-money-works" className="inline-block text-xs font-medium text-stamp-dark underline">
          Full breakdown &amp; live calculator →
        </a>
      </div>
    </details>
  );
}
