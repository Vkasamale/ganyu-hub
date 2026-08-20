import React from "react";

/**
 * "How the money works", as a native <details>. Zero JS, works before
 * hydration. Numbers come from one source so the copy never drifts.
 */
export function PricingExplainer({ audience = "both", betaZeroCommission = true, platformCommission = 0.1, payoutRate = 0.03, bankFlatFee = 700, style, ...rest }) {
  const commissionLine = betaZeroCommission
    ? "During beta, Ganyu Hub takes no commission — the creative keeps the full agreed price."
    : "Ganyu Hub keeps a " + Math.round(platformCommission * 100) + "% platform commission from the agreed price.";
  const forClient = audience !== "creative";
  const n = (i) => (forClient ? i : i - 1);
  const step = { marginBottom: 8 };
  const strong = { fontWeight: "var(--weight-medium)", color: "var(--gh-ink)" };

  return (
    <details
      {...rest}
      style={{ borderRadius: "var(--radius-inset)", border: "1px solid var(--border-inset)", background: "var(--surface-inset)", padding: "12px 16px", fontSize: "var(--text-sm)", color: "var(--gh-ink-80)", ...style }}
    >
      <summary style={{ cursor: "pointer", listStyle: "none", fontWeight: "var(--weight-medium)", color: "var(--gh-ink)" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          How the money works
          <span style={{ fontSize: "var(--text-xs)", fontWeight: 400, color: "var(--gh-ink-45)" }}>(tap to expand)</span>
        </span>
      </summary>
      <div style={{ marginTop: 12, overflowWrap: "break-word" }}>
        <ol style={{ margin: 0, padding: 0, listStyle: "none" }}>
          <li style={step}><span style={strong}>1. Agree a price.</span> The creative&rsquo;s bid is the price for the work.</li>
          {forClient && (
            <li style={step}>
              <span style={strong}>2. Client pays into escrow.</span> The client pays the agreed price plus a small
              mobile-money/card processing fee (~3%). The money is <span style={{ fontWeight: "var(--weight-medium)" }}>held safely</span> — the creative can&rsquo;t touch it yet.
            </li>
          )}
          <li style={step}><span style={strong}>{n(3)}. Work happens.</span> The creative delivers; the client reviews and approves.</li>
          <li style={step}>
            <span style={strong}>{n(4)}. Payout.</span> On approval, escrow is released to the creative. {commissionLine} A payout fee of{" "}
            {Math.round(payoutRate * 100)}% is taken by the mobile-money/bank provider on the transfer out (bank transfers add a flat MWK {bankFlatFee.toLocaleString()}).
          </li>
        </ol>
        <p style={{ marginTop: 12, fontSize: "var(--text-xs)", color: "var(--gh-ink-55)" }}>
          Every figure you see on the platform (what the client pays, what the creative receives) already includes these fees, so there are no surprises at checkout.
        </p>
        <a href="/how-money-works" style={{ display: "inline-block", marginTop: 8, fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--gh-teal-dark)", textDecoration: "underline" }}>
          Full breakdown &amp; live calculator &rarr;
        </a>
      </div>
    </details>
  );
}
