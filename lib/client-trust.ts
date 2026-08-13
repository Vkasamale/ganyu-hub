// Phase 2 — derived trust numbers (IMPLEMENTATION_PLAN.md items 18-23, audit
// §G2, §F3, §F9). Zero schema: every figure here is computed from rows we
// already hold.
//
// The point of this file is item 24, the "About the client" block — the plan
// calls it the biggest single gap in the product, because it is what tells a
// creative whether writing a proposal is worth their evening.
//
// This is also the ONE definition of these numbers. /clients/[id] previously
// computed its own hire rate off a different formula; two answers to "what is
// this client's hire rate" is worse than either answer alone.
//
// Two rules run through all of it:
//
//   1. A number nobody can act on is worse than no number. Every field needing
//      a sample size returns null below its threshold and the UI omits the row
//      (§Q7). One job with one accepted proposal is not a "100% hire rate".
//   2. Nothing claims more than we know. We do not verify phone numbers, so
//      nothing here says "verified" — see phoneOnFile.

export type ClientTrust = {
  jobsPosted: number;
  jobsOpen: number;
  /** Accepted proposals ÷ jobs posted. Null below MIN_JOBS_FOR_RATE. */
  hireRate: number | null;
  totalSpentMwk: number;
  memberSince: string | null;
  /** Has ever put money in escrow — the strongest signal we hold. */
  hasFundedEscrow: boolean;
  /** Has hired the same creative on more than one job. */
  isRepeatClient: boolean;
  /** Median minutes to reply to the other party. Null below MIN_REPLIES. */
  medianReplyMins: number | null;
  /** A number is on the profile. NOT verified — there is no OTP flow. */
  phoneOnFile: boolean;
  /**
   * Item 31 (§G3): what creatives who worked for this client said about them.
   * The client direction of reviews already existed structurally — reviews are
   * role-neutral — but was never shown where the decision gets made.
   */
  rating: number | null;
  reviewCount: number;
};

// Below three jobs a percentage is noise: one job reads as either 0% or 100%
// and both are wrong about the person.
const MIN_JOBS_FOR_RATE = 3;
// Same argument for reply speed — two fast replies is a mood, not a habit.
const MIN_REPLIES = 3;

export async function getClientTrust(supabase: any, clientId: string): Promise<ClientTrust> {
  const [{ data: profile }, { data: jobs }, { data: threads }] = await Promise.all([
    supabase.from("profiles").select("created_at, phone").eq("id", clientId).maybeSingle(),
    supabase
      .from("jobs")
      .select("id, status, escrow_status, total_paid_mwk, accepted_bid_mwk")
      .eq("client_id", clientId),
    supabase.from("message_threads").select("id").eq("client_id", clientId),
  ]);

  // Item 31: reviews written ABOUT this client, by creatives who worked for
  // them. Same table, other direction.
  const { data: clientReviews } = await supabase
    .from("reviews")
    .select("rating")
    .eq("reviewee_id", clientId);
  const reviewCount = (clientReviews || []).length;
  const rating = reviewCount
    ? (clientReviews as { rating: number }[]).reduce((s2, r) => s2 + r.rating, 0) / reviewCount
    : null;

  const jobRows = (jobs || []) as any[];
  const jobIds = jobRows.map((j) => j.id);

  const [{ data: accepted }, medianReplyMins] = await Promise.all([
    jobIds.length
      ? supabase.from("proposals").select("job_id, creative_id").in("job_id", jobIds).eq("status", "accepted")
      : Promise.resolve({ data: [] }),
    medianReply(supabase, ((threads || []) as any[]).map((t) => t.id), clientId),
  ]);

  const acceptedRows = (accepted || []) as any[];

  // Repeat client = the same creative accepted on more than one job. Someone
  // coming back to a creative is the signal here, not raw job count.
  const perCreative = new Map<string, number>();
  for (const a of acceptedRows) {
    perCreative.set(a.creative_id, (perCreative.get(a.creative_id) || 0) + 1);
  }

  let totalSpentMwk = 0;
  let hasFundedEscrow = false;
  let jobsOpen = 0;
  for (const j of jobRows) {
    const funded = j.escrow_status === "payment_held" || j.escrow_status === "payment_released";
    if (funded) {
      hasFundedEscrow = true;
      totalSpentMwk += (j.total_paid_mwk as number | null) ?? (j.accepted_bid_mwk as number | null) ?? 0;
    }
    if (j.status === "open") jobsOpen += 1;
  }

  return {
    jobsPosted: jobRows.length,
    jobsOpen,
    // Capped at 1: legacy rows carry an accepted proposal on a job that was
    // later reopened, and "120% hired" would look like a bug because it is one.
    hireRate:
      jobRows.length >= MIN_JOBS_FOR_RATE ? Math.min(1, acceptedRows.length / jobRows.length) : null,
    totalSpentMwk,
    memberSince: profile?.created_at ?? null,
    hasFundedEscrow,
    isRepeatClient: Array.from(perCreative.values()).some((n) => n > 1),
    medianReplyMins,
    phoneOnFile: !!(profile?.phone && String(profile.phone).trim()),
    rating,
    reviewCount,
  };
}

/**
 * Median minutes between someone messaging this user and this user replying.
 *
 * ponytail: one query over the user's threads, paired in memory. Only the
 * FIRST reply after each inbound run counts — a five-message burst answered
 * once is one response, not five, and counting each would flatter the number.
 * Median rather than mean: one reply sent after a weekend should not define
 * someone's reputation.
 */
async function medianReply(supabase: any, threadIds: string[], userId: string): Promise<number | null> {
  if (!threadIds.length) return null;

  const { data } = await supabase
    .from("messages")
    .select("thread_id, sender_id, created_at")
    .in("thread_id", threadIds)
    .order("created_at", { ascending: true });

  const byThread = new Map<string, { sender_id: string; created_at: string }[]>();
  for (const m of (data || []) as any[]) {
    const list = byThread.get(m.thread_id);
    if (list) list.push(m);
    else byThread.set(m.thread_id, [m]);
  }

  const gaps: number[] = [];
  for (const msgs of byThread.values()) {
    let awaitingSince: number | null = null;
    for (const m of msgs) {
      const at = new Date(m.created_at).getTime();
      if (m.sender_id !== userId) {
        // Clock starts on the first inbound message of a run only.
        if (awaitingSince == null) awaitingSince = at;
      } else if (awaitingSince != null) {
        gaps.push((at - awaitingSince) / 60000);
        awaitingSince = null;
      }
    }
  }

  if (gaps.length < MIN_REPLIES) return null;
  gaps.sort((a, b) => a - b);
  const mid = Math.floor(gaps.length / 2);
  return gaps.length % 2 ? gaps[mid] : (gaps[mid - 1] + gaps[mid]) / 2;
}

/** "under an hour" / "about 3 hours" / "about 2 days" — never "127 minutes". */
/**
 * Item 54 — the trust row on a job card, for a whole list at once.
 *
 * getClientTrust above runs 3+ queries per client, which is right for one
 * profile and wrong for twenty cards. This is two queries for the entire page.
 *
 * It deliberately returns a SUBSET: only the figures derivable from jobs and
 * proposals alone. Reply time and reviews need per-client work and belong on
 * the client's own page, not on a card someone is scanning. Same thresholds
 * and same definitions as above — a cheaper route to the same numbers, never a
 * second opinion about them.
 */
export type CardTrust = {
  jobsPosted: number;
  hasFundedEscrow: boolean;
  /** Accepted ÷ posted. Null below MIN_JOBS_FOR_RATE, exactly as above. */
  hireRate: number | null;
};

export async function getClientTrustBatch(
  supabase: any,
  clientIds: string[],
): Promise<Map<string, CardTrust>> {
  const out = new Map<string, CardTrust>();
  const ids = Array.from(new Set(clientIds.filter(Boolean)));
  if (!ids.length) return out;

  const { data: jobs } = await supabase
    .from("jobs")
    .select("id, client_id, escrow_status")
    .in("client_id", ids);

  const jobIds = (jobs || []).map((j: any) => j.id);
  const { data: accepted } = jobIds.length
    ? await supabase.from("proposals").select("job_id").eq("status", "accepted").in("job_id", jobIds)
    : { data: [] };

  const acceptedJobIds = new Set((accepted || []).map((p: any) => p.job_id));

  for (const id of ids) {
    const mine = (jobs || []).filter((j: any) => j.client_id === id);
    const hired = mine.filter((j: any) => acceptedJobIds.has(j.id)).length;
    out.set(id, {
      jobsPosted: mine.length,
      hasFundedEscrow: mine.some(
        (j: any) => j.escrow_status === "payment_held" || j.escrow_status === "payment_released",
      ),
      hireRate: mine.length >= MIN_JOBS_FOR_RATE ? hired / mine.length : null,
    });
  }
  return out;
}

export function formatReplyTime(mins: number): string {
  if (mins < 60) return "under an hour";
  const hours = Math.round(mins / 60);
  if (hours < 24) return `about ${hours} hour${hours === 1 ? "" : "s"}`;
  const days = Math.round(hours / 24);
  return `about ${days} day${days === 1 ? "" : "s"}`;
}
