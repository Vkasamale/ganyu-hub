/**
 * The "How the money works" disclosure. Drop it on job-post, proposal and
 * payments surfaces — anywhere someone is about to commit money.
 *
 * @startingPoint section="Money" subtitle="Zero-JS fee disclosure, client or creative wording" viewport="700x140"
 */
export interface PricingExplainerProps {
  /** `both`/`client` include the escrow-payment step; `creative` drops it and renumbers. */
  audience?: "client" | "creative" | "both";
  betaZeroCommission?: boolean;
  platformCommission?: number;
  payoutRate?: number;
  bankFlatFee?: number;
}
export function PricingExplainer(props: PricingExplainerProps): JSX.Element;
