// Last-activity preview for the conversation list. A job thread's "last thing
// that happened" is whichever is newer: a typed message or a job event. Events
// read fine as previews ("Payment released to creative"), so they need no
// special casing at the display end.
//
// ponytail: two batched queries over the user's own threads, newest-first per
// thread resolved in JS. A per-thread lateral join would be tighter, but that
// needs an RPC and nobody has enough threads for it to matter yet.

import { JOB_EVENT_LABELS } from "@/components/job-timeline";
import type { JobEventType } from "@/lib/job-events";

export type ThreadPreview = { text: string; at: string };

type MinimalThread = { id: string; job_id: string | null; created_at: string };

export async function withPreviews<T extends MinimalThread>(
  supabase: any,
  threads: T[]
): Promise<(T & { preview: ThreadPreview | null })[]> {
  if (!threads.length) return [];

  const threadIds = threads.map((t) => t.id);
  const jobIds = threads.map((t) => t.job_id).filter((id): id is string => !!id);

  const [{ data: msgs }, { data: evs }] = await Promise.all([
    supabase
      .from("messages")
      .select("thread_id, body, attachment_name, created_at")
      .in("thread_id", threadIds)
      .order("created_at", { ascending: false }),
    jobIds.length
      ? supabase
          .from("job_events")
          .select("job_id, event_type, created_at")
          .in("job_id", jobIds)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [] }),
  ]);

  // Rows arrive newest-first, so the first hit per key is the latest one.
  const lastMsg = new Map<string, { text: string; at: string }>();
  for (const m of (msgs || []) as any[]) {
    if (lastMsg.has(m.thread_id)) continue;
    const text = (m.body || "").replace(/\[\[job:[0-9a-f-]+\]\]/gi, "").trim();
    lastMsg.set(m.thread_id, {
      text: text || (m.attachment_name ? `📎 ${m.attachment_name}` : "Shared a job"),
      at: m.created_at,
    });
  }

  const lastEvent = new Map<string, { text: string; at: string }>();
  for (const e of (evs || []) as any[]) {
    if (lastEvent.has(e.job_id)) continue;
    lastEvent.set(e.job_id, {
      text: JOB_EVENT_LABELS[e.event_type as JobEventType] ?? e.event_type,
      at: e.created_at,
    });
  }

  return threads.map((t) => {
    const m = lastMsg.get(t.id) || null;
    const e = t.job_id ? lastEvent.get(t.job_id) || null : null;
    let preview: ThreadPreview | null = null;
    if (m && e) preview = new Date(m.at) >= new Date(e.at) ? m : e;
    else preview = m || e;
    return { ...t, preview };
  });
}

// Newest activity first, falling back to when the thread was created so a
// brand-new empty conversation still sorts sensibly.
export function byRecentActivity<T extends MinimalThread & { preview?: ThreadPreview | null }>(
  threads: T[]
): T[] {
  const at = (t: T) => new Date(t.preview?.at || t.created_at).getTime();
  return [...threads].sort((a, b) => at(b) - at(a));
}
