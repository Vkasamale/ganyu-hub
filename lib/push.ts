import "server-only";
import { createServerClient } from "@supabase/ssr";

// Web push sending. Server-only — VAPID_PRIVATE_KEY must never reach a bundle.
//
// Same service-role pattern as lib/job-events.ts: push_subscriptions is
// owner-read-only under RLS, and the sender is by definition not the owner.

function serviceClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

// web-push is CJS and pulls in crypto at import time; load it lazily so a
// route that never sends a push doesn't pay for it.
async function configured() {
  const pub = process.env.VAPID_PUBLIC_KEY || process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) return null;
  const webpush = (await import("web-push")).default;
  // mailto: subject is required by the VAPID spec — push services use it to
  // contact us if we misbehave. Not a user-facing address.
  webpush.setVapidDetails("mailto:support@ganyuhub.com", pub, priv);
  return webpush;
}

/**
 * Send a notification to every device `profileId` has subscribed.
 *
 * Never throws. Push is a courtesy on top of an action that has already
 * happened — a dead endpoint or a missing VAPID key must not roll back a
 * payout or 500 a webhook. Failures are logged, not raised.
 */
export async function sendPushNotification(
  profileId: string,
  title: string,
  body: string,
  url = "/dashboard",
): Promise<{ sent: number; removed: number }> {
  const result = { sent: 0, removed: 0 };
  const admin = serviceClient();
  const webpush = await configured();
  if (!admin || !webpush) {
    console.error("[push] not configured (service role or VAPID keys missing), skipped:", title);
    return result;
  }

  const { data: subs } = await admin
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("profile_id", profileId);
  if (!subs?.length) return result;

  const payload = JSON.stringify({ title, body, url, tag: url });

  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          payload,
        );
        result.sent++;
      } catch (err: any) {
        // 404 / 410 mean the push service has permanently dropped this
        // endpoint — the user uninstalled, cleared site data, or the
        // subscription expired. Delete it, or we retry a dead endpoint on
        // every release forever and the error log becomes noise.
        if (err?.statusCode === 404 || err?.statusCode === 410) {
          await admin.from("push_subscriptions").delete().eq("endpoint", s.endpoint);
          result.removed++;
        } else {
          // Anything else (429, 5xx, network) is transient. Leave the row.
          console.error("[push] send failed:", err?.statusCode, err?.message);
        }
      }
    }),
  );
  return result;
}

/**
 * Proof-of-concept trigger: the creative's phone buzzes when their money moves.
 *
 * Called from logJobEvent on 'payment_released' rather than from the two
 * release call sites (app/actions.ts reconcilePayout and the PayChangu
 * webhook). Both of those sit behind a compare-and-swap that already
 * guarantees exactly one event row, so hooking the log means exactly one push
 * — wiring both call sites separately would risk drifting apart the way
 * JOB_EVENT_TYPES and the SQL constraint did.
 */
export async function notifyPaymentReleased(jobId: string): Promise<void> {
  const admin = serviceClient();
  if (!admin) return;

  const [{ data: job }, { data: proposal }] = await Promise.all([
    admin.from("jobs").select("title").eq("id", jobId).maybeSingle(),
    admin
      .from("proposals")
      .select("creative_id")
      .eq("job_id", jobId)
      .eq("status", "accepted")
      .maybeSingle(),
  ]);
  if (!proposal?.creative_id) return;

  await sendPushNotification(
    proposal.creative_id,
    "Payment released",
    `You've been paid for ${job?.title || "your job"}`,
    `/jobs/${jobId}`,
  );
}
