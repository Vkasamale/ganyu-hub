import type { SupabaseClient } from "@supabase/supabase-js";

export type FeedKind = "for_you_jobs" | "for_you_creatives" | "trending_jobs" | "trending_creatives";

export async function getForYouJobs(supabase: SupabaseClient, userId: string, limit = 6) {
  const { data: me } = await supabase.from("profiles").select("categories, skills").eq("id", userId).single();
  const cats: string[] = me?.categories || [];
  let q = supabase.from("jobs").select("*").eq("status", "open").eq("visibility", "public").neq("client_id", userId);
  if (cats.length) q = q.in("category", cats);
  const { data } = await q.order("created_at", { ascending: false }).limit(limit);
  return data || [];
}

export async function getForYouCreatives(supabase: SupabaseClient, userId: string, limit = 6) {
  const { data: myJobs } = await supabase.from("jobs").select("category").eq("client_id", userId).limit(20);
  const cats = Array.from(new Set((myJobs || []).map((j: any) => j.category)));
  let q = supabase.from("profiles").select("*").in("role", ["creative", "agency"]).neq("id", userId);
  if (cats.length) q = q.overlaps("categories", cats);
  // ponytail: fetch a wider pool so rating can re-rank the top N. Early days
  // the pool is small anyway — this is a no-op until reviews accumulate.
  const pool = Math.max(limit * 4, 24);
  const { data } = await q.order("created_at", { ascending: false }).limit(pool);
  const candidates = data || [];
  if (candidates.length <= limit) return candidates;
  const ids = candidates.map((c: any) => c.id);
  const { data: reviews } = await supabase.from("reviews").select("reviewee_id, rating").in("reviewee_id", ids);
  const sums = new Map<string, { total: number; count: number }>();
  (reviews || []).forEach((r: any) => {
    const cur = sums.get(r.reviewee_id) || { total: 0, count: 0 };
    cur.total += r.rating;
    cur.count += 1;
    sums.set(r.reviewee_id, cur);
  });
  const scored = candidates.map((c: any) => {
    const s = sums.get(c.id);
    const avg = s && s.count > 0 ? s.total / s.count : 0;
    // Bayesian-ish: rating * log(count+1). Unrated sink, but not to zero if
    // nobody has reviews yet — the sort is stable so recency still wins ties.
    return { row: c, score: avg * Math.log((s?.count || 0) + 1) };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((x) => x.row);
}

export async function getTrending(supabase: SupabaseClient, kind: "job" | "creative", limit = 6) {
  const { data: ids } = await supabase.rpc("trending_items", { p_target_type: kind, p_limit: limit });
  const targetIds = (ids || []).map((r: any) => r.target_id);
  if (!targetIds.length) {
    if (kind === "job") {
      const { data } = await supabase.from("jobs").select("*").eq("status", "open").eq("visibility", "public").order("created_at", { ascending: false }).limit(limit);
      return data || [];
    }
    const { data } = await supabase.from("profiles").select("*").in("role", ["creative", "agency"]).order("created_at", { ascending: false }).limit(limit);
    return data || [];
  }
  if (kind === "job") {
    const { data } = await supabase.from("jobs").select("*").in("id", targetIds);
    return data || [];
  }
  const { data } = await supabase.from("profiles").select("*").in("id", targetIds);
  return data || [];
}

/**
 * Item 52 — what you were last looking at.
 *
 * Rebuilds the thread for someone who browsed on their phone yesterday and
 * came back on a borrowed laptop today, which in this market is the normal
 * case rather than the edge one.
 *
 * Dedupes by target keeping the most recent visit, so opening one profile four
 * times does not fill the row with itself. Reads from `interactions`, which
 * recordView already writes — no new table and no new write path.
 */
export async function getRecentlyViewed(
  supabase: SupabaseClient,
  userId: string,
  targetType: "job" | "creative",
  limit = 8,
) {
  const { data: views } = await supabase
    .from("interactions")
    .select("target_id, created_at")
    .eq("user_id", userId)
    .eq("kind", "view")
    .eq("target_type", targetType)
    .order("created_at", { ascending: false })
    .limit(limit * 6);

  const seen: string[] = [];
  for (const v of (views || []) as { target_id: string }[]) {
    if (!seen.includes(v.target_id)) seen.push(v.target_id);
    if (seen.length >= limit) break;
  }
  if (!seen.length) return [];

  const { data } = await supabase
    .from(targetType === "job" ? "jobs" : "profiles")
    .select("*")
    .in("id", seen);

  // Preserve most-recent-first: `in` returns rows in table order, not ours.
  return seen.map((id) => (data || []).find((r: any) => r.id === id)).filter(Boolean);
}

/**
 * Item 51 (§G4) — "people who viewed this also viewed".
 *
 * Two hops over `interactions`: who else opened this profile, then what else
 * those people opened. Ranked by how many of them opened it.
 *
 * ponytail: two queries and a Map, not a recommendation engine. With the
 * volume this platform has, co-view IS the algorithm — anything cleverer would
 * be fitting a model to a dozen rows.
 *
 * Returns [] below `minOverlap` viewers rather than showing a row built on one
 * person's browsing. A "customers also viewed" of sample size 1 is not social
 * proof, it is an accident presented as a pattern.
 */
export async function getAlsoViewed(
  supabase: SupabaseClient,
  targetType: "job" | "creative",
  targetId: string,
  limit = 6,
  minOverlap = 2,
) {
  const { data: viewers } = await supabase
    .from("interactions")
    .select("user_id")
    .eq("target_type", targetType)
    .eq("target_id", targetId)
    .eq("kind", "view")
    .limit(200);

  const viewerIds = Array.from(new Set((viewers || []).map((v: any) => v.user_id)));
  if (viewerIds.length < minOverlap) return [];

  const { data: others } = await supabase
    .from("interactions")
    .select("target_id, user_id")
    .eq("target_type", targetType)
    .eq("kind", "view")
    .neq("target_id", targetId)
    .in("user_id", viewerIds)
    .limit(1000);

  // Count DISTINCT viewers per target, not raw views — one person refreshing a
  // profile ten times is not ten people finding it interesting.
  const byTarget = new Map<string, Set<string>>();
  for (const row of (others || []) as { target_id: string; user_id: string }[]) {
    if (!byTarget.has(row.target_id)) byTarget.set(row.target_id, new Set());
    byTarget.get(row.target_id)!.add(row.user_id);
  }

  const ranked = [...byTarget.entries()]
    .filter(([, users]) => users.size >= minOverlap)
    .sort((a, b) => b[1].size - a[1].size)
    .slice(0, limit)
    .map(([id]) => id);
  if (!ranked.length) return [];

  const { data } = await supabase
    .from(targetType === "job" ? "jobs" : "profiles")
    .select("*")
    .in("id", ranked);

  return ranked.map((id) => (data || []).find((r: any) => r.id === id)).filter(Boolean);
}

export async function getSavedIds(supabase: SupabaseClient, userId: string, targetType: "job" | "creative") {
  const { data } = await supabase.from("saved_items").select("target_id").eq("user_id", userId).eq("target_type", targetType);
  return new Set((data || []).map((r: any) => r.target_id));
}
