export function formatSAST(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-ZA", {
      timeZone: "Africa/Johannesburg",
      year: "numeric", month: "short", day: "2-digit",
      hour: "2-digit", minute: "2-digit",
      hour12: false,
    }) + " SAST";
  } catch {
    return iso;
  }
}

export type ErrorGroup = "payments" | "payouts" | "proposals" | "other";

export function groupOperation(op: string): ErrorGroup {
  if (/^(payment_|verify_payment|topup_)/.test(op)) return "payments";
  if (/^(payout_|verify_payout|reconcile_payout)/.test(op)) return "payouts";
  if (/^(proposal_|invite_)/.test(op)) return "proposals";
  return "other";
}
