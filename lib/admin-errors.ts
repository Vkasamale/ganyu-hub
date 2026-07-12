import { createServerClient } from "@supabase/ssr";

export type LogInput = {
  operation: string;
  jobId?: string | null;
  userId?: string | null;
  error: unknown;
  context?: Record<string, any>;
};

export const GENERIC_MONEY_ERROR = (ref?: string | null) =>
  `We hit an issue processing this. Our team has been notified and is looking into it.${ref ? ` Reference: ${ref}.` : ""}`;

export const GENERIC_ERROR = (ref?: string | null) =>
  `Something went wrong. Please try again in a moment.${ref ? ` Reference: ${ref}.` : ""}`;

function serviceClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

export async function logAdminError(input: LogInput): Promise<string | null> {
  const admin = serviceClient();
  if (!admin) {
    console.error("[admin-error] service key missing, cannot log:", input.operation, input.error);
    return null;
  }
  const message = String((input.error as any)?.message || input.error || "unknown error").slice(0, 1000);
  try {
    const { data } = await admin.from("admin_errors").insert({
      operation: input.operation,
      job_id: input.jobId || null,
      user_id: input.userId || null,
      message,
      context: input.context || null,
    }).select("short_id, id").single();

    if (data?.short_id) {
      try {
        const { data: admins } = await admin.from("profiles").select("id").eq("is_admin", true);
        for (const a of admins || []) {
          await admin.from("notifications").insert({
            user_id: a.id,
            kind: "message_received",
            title: `New error ${data.short_id}`,
            body: `${input.operation}: ${message.slice(0, 140)}`,
            link: `/admin/errors`,
          });
        }
      } catch { /* ignore */ }
    }
    return data?.short_id || null;
  } catch (e) {
    console.error("[admin-error] insert failed:", e, input);
    return null;
  }
}
