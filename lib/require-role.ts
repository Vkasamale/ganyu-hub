import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/supabase/user";

/**
 * Role gating for creative-side tools.
 *
 * The gap this closes: the dashboard nav hides Portfolio, Rate card and
 * Testimonials from clients, but the ROUTES were open. A client who typed
 * /dashboard/portfolio could add portfolio items, and RLS would allow it —
 * those policies key on `auth.uid() = profile_id`, which a client satisfies
 * about their own row. Hiding a link is not access control.
 *
 * Scope, decided 2026-08-12: block clients from creative tools, and nothing
 * else. Creatives are NOT blocked from posting jobs — a creative who wants to
 * hire someone should not need a second account. The walls worth adding are
 * the ones that prevent a real mistake, not the ones that look tidy.
 *
 * `agency` counts as creative-side: agencies sell work, and the enum has
 * always allowed both behaviours.
 */

export type Role = "client" | "creative" | "agency";

const SELLS_WORK: Role[] = ["creative", "agency"];

/** Cached per request, so a page and its actions do not re-query the profile. */
export const getSessionRole = cache(
  async (): Promise<{ role: Role | null; isAdmin: boolean }> => {
    const user = await getSessionUser();
    if (!user) return { role: null, isAdmin: false };
    const supabase = createClient();
    const { data } = await supabase
      .from("profiles")
      .select("role, is_admin")
      .eq("id", user.id)
      .maybeSingle();
    return { role: (data?.role as Role) ?? null, isAdmin: !!data?.is_admin };
  },
);

/**
 * Admins pass every gate. They already run the dispute queue and the admin
 * console, and an admin who cannot open the surface they are being asked
 * about is an admin who cannot do their job. `is_admin` is set in the database
 * only — there is no UI that grants it.
 */
function allowed(role: Role | null, isAdmin: boolean): boolean {
  return isAdmin || (role !== null && SELLS_WORK.includes(role));
}

/**
 * For PAGES. Redirects rather than throwing: a client who lands on a creative
 * tool has not done anything wrong — they followed a stale link or typed a
 * URL. Send them somewhere useful instead of showing a wall.
 */
export async function requireSellerPage(): Promise<void> {
  const { role, isAdmin } = await getSessionRole();
  if (role === null && !isAdmin) redirect("/login");
  if (!allowed(role, isAdmin)) redirect("/dashboard");
}

/**
 * For ACTIONS. Returns an error in the shape every action here already
 * returns, so callers need no new handling. This is the half that actually
 * matters — a page redirect is cosmetic if the action behind it still runs.
 */
export async function requireSellerAction(): Promise<{ error: string } | null> {
  const { role, isAdmin } = await getSessionRole();
  if (role === null && !isAdmin) return { error: "Not signed in" };
  if (!allowed(role, isAdmin)) {
    return { error: "This is a creative tool. Your account is set up as a client." };
  }
  return null;
}
