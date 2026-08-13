import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { checkProfileComplete } from "@/lib/profile-complete";
import { absUrl } from "@/lib/site-url";
import { ALL_CATEGORY_SLUGS } from "@/lib/task-phrases";

/**
 * BACKLOG "Domain unlocked" §4. Only worth shipping now the site has a real
 * domain to be indexed under.
 *
 * Creative profiles are filtered by the SAME completeness rule /browse uses to
 * decide whether a creative is listed at all. Submitting a half-finished
 * profile to Google is submitting a thin page with our name on it, and the
 * creative gets judged by it.
 *
 * ponytail: no lastModified on the category pages — their content is the live
 * listing, so any date we wrote would be a guess.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient();

  const staticRoutes = ["/", "/browse", "/jobs", "/login", "/signup"].map((path) => ({
    url: absUrl(path),
    changeFrequency: "daily" as const,
    priority: path === "/" ? 1 : 0.7,
  }));

  const categoryRoutes = ALL_CATEGORY_SLUGS.map((slug) => ({
    url: absUrl(`/c/${slug}`),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  const [{ data: profiles }, { data: jobs }] = await Promise.all([
    supabase.from("profiles").select("*").neq("role", "client"),
    supabase.from("jobs").select("id, created_at").eq("status", "open"),
  ]);

  const ids = (profiles || []).map((p: { id: string }) => p.id);
  const portfolioCount = new Map<string, number>();
  const serviceCount = new Map<string, number>();
  if (ids.length) {
    const [{ data: portfolioRows }, { data: serviceRows }] = await Promise.all([
      supabase.from("portfolio_items").select("profile_id").in("profile_id", ids),
      supabase.from("services").select("profile_id").in("profile_id", ids),
    ]);
    (portfolioRows || []).forEach((r: { profile_id: string }) =>
      portfolioCount.set(r.profile_id, (portfolioCount.get(r.profile_id) || 0) + 1),
    );
    (serviceRows || []).forEach((r: { profile_id: string }) =>
      serviceCount.set(r.profile_id, (serviceCount.get(r.profile_id) || 0) + 1),
    );
  }

  const creativeRoutes = (profiles || [])
    .filter(
      (p: { id: string; headline?: string | null; bio?: string | null }) =>
        checkProfileComplete(p, portfolioCount.get(p.id) || 0, serviceCount.get(p.id) || 0).complete,
    )
    .map((p: { id: string }) => ({
      url: absUrl(`/creatives/${p.id}`),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

  const jobRoutes = (jobs || []).map((j: { id: string; created_at: string }) => ({
    url: absUrl(`/jobs/${j.id}`),
    lastModified: new Date(j.created_at),
    changeFrequency: "daily" as const,
    priority: 0.5,
  }));

  return [...staticRoutes, ...categoryRoutes, ...creativeRoutes, ...jobRoutes];
}
