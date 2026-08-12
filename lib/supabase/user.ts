import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

/**
 * BUG-020. `supabase.auth.getUser()` is a NETWORK call to the Supabase Auth
 * API, not a local token check — which is exactly why it is the secure choice
 * on the server, and also why calling it three times to render one page costs
 * three round trips against a rate-limited endpoint.
 *
 * Measured 2026-08-12: one dashboard page view made three calls —
 * components/navbar.tsx, app/dashboard/layout.tsx and app/dashboard/page.tsx —
 * all within a single request. Sustained navigation tripped the project's auth
 * limit, and every server action then behaved as signed-out, silently.
 *
 * React's `cache()` dedupes per request render, so those three collapse into
 * one. Nothing is weakened: the same validated `getUser()` still runs, once,
 * and the result never crosses a request boundary.
 *
 * Server actions are separate requests and keep their own call. That is
 * correct, not an oversight — an action must re-validate its caller rather
 * than trust something a page render decided earlier.
 */
export const getSessionUser = cache(async (): Promise<User | null> => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
});
