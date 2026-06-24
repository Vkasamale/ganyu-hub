import type { SupabaseClient } from "@supabase/supabase-js";

export type FeedKind = "for_you_jobs" | "for_you_creatives" | "trending_jobs" | "trending_creatives";

export async function getForYouJobs(supabase: SupabaseClient, userId: string, limit = 6) {
  const { data: me } = await supabase.from("profiles").select("categories, skills").eq("id", userId).single();
  const cats: string[] = me?.categories || [];
  let q = supabase.from("jobs").select("*").eq("status", "open").neq("client_id", userId);
  if (cats.length) q = q.in("category", cats);
  const { data } = await q.order("created_at", { ascending: false }).limit(limit);
  return data || [];
}

export async function getForYouCreatives(supabase: SupabaseClient, userId: string, limit = 6) {
  const { data: myJobs } = await supabase.from("jobs").select("category").eq("client_id", userId).limit(20);
  const cats = Array.from(new Set((myJobs || []).map((j: any) => j.category)));
  let q = supabase.from("profiles").select("*").in("role", ["creative", "agency"]).neq("id", userId);
  if (cats.length) q = q.overlaps("categories", cats);
  const { data } = await q.order("created_at", { ascending: false }).limit(limit);
  return data || [];
}

export async function getTrending(supabase: SupabaseClient, kind: "job" | "creative", limit = 6) {
  const { data: ids } = await supabase.rpc("trending_items", { p_target_type: kind, p_limit: limit });
  const targetIds = (ids || []).map((r: any) => r.target_id);
  if (!targetIds.length) {
    if (kind === "job") {
      const { data } = await supabase.from("jobs").select("*").eq("status", "open").order("created_at", { ascending: false }).limit(limit);
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

export async function getSavedIds(supabase: SupabaseClient, userId: string, targetType: "job" | "creative") {
  const { data } = await supabase.from("saved_items").select("target_id").eq("user_id", userId).eq("target_type", targetType);
  return new Set((data || []).map((r: any) => r.target_id));
}
