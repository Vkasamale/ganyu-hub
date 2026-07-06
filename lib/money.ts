import { createClient } from "@/lib/supabase/server";

// The single source of truth for client money figures. Every "spent" number in
// the UI must come from getReleasedSpend; every "committed" number from
// getCommittedValue. Do not re-derive these definitions inline anywhere else.

// A job's escrowed value, client-side, is budget_mwk (that's the amount the
// escrow status tracks). Released = money that actually left escrow to the
// creative — the only thing we're allowed to call "spent".
const COMMITTED_STATUSES = ["scope_pending", "in_progress", "submitted", "revision_requested"];

function sumBudget(rows: { budget_mwk: number | null }[] | null): number {
  return (rows || []).reduce((s, r) => s + (r.budget_mwk || 0), 0);
}

/** Total the client has actually spent (escrow released to creatives). */
export async function getReleasedSpend(clientId: string, sinceDate?: Date): Promise<number> {
  const supabase = createClient();
  let q = supabase
    .from("jobs")
    .select("budget_mwk")
    .eq("client_id", clientId)
    .eq("escrow_status", "payment_released");
  // ponytail: no released_at column, so "since" filters on job creation, not
  // release date. Good enough pre-beta; add a released_at timestamp if the
  // 6-month window ever needs to be exact.
  if (sinceDate) q = q.gte("created_at", sinceDate.toISOString());
  const { data } = await q;
  return sumBudget(data);
}

/** Value the client has committed to in-flight jobs (not yet released). */
export async function getCommittedValue(clientId: string): Promise<number> {
  const supabase = createClient();
  const { data } = await supabase
    .from("jobs")
    .select("budget_mwk")
    .eq("client_id", clientId)
    .in("status", COMMITTED_STATUSES);
  return sumBudget(data);
}
