import { createServerClient } from "@supabase/ssr";
import { headers } from "next/headers";

// Fixed-window rate limit backed by Postgres (check_rate_limit RPC). Uses the
// service-role client so it works on unauthenticated endpoints. Fail-open: if
// the limiter can't run (unconfigured / DB error) we allow the request rather
// than lock legitimate users out — this is abuse control, not authorization.
export async function rateLimit(key: string, max: number, windowSeconds: number): Promise<boolean> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return true;
  const admin = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
  const { data, error } = await admin.rpc("check_rate_limit", {
    p_key: key,
    p_max: max,
    p_window_seconds: windowSeconds,
  });
  if (error) return true;
  return data === true;
}

// Best-effort client IP from proxy headers. Vercel sets x-forwarded-for; take
// the first hop. Falls back to a constant so a missing header buckets everyone
// together (still limited, just coarser) rather than throwing.
export async function clientIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for") || "";
  return fwd.split(",")[0].trim() || h.get("x-real-ip") || "unknown";
}
