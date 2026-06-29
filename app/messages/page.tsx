import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { timeAgo } from "@/lib/utils";

export default async function MessagesPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: threads } = await supabase
    .from("message_threads")
    .select("*, client:profiles!message_threads_client_id_fkey(id, full_name), creative:profiles!message_threads_creative_id_fkey(id, full_name)")
    .or(`client_id.eq.${user.id},creative_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <header>
        <p className="eyebrow">Inbox</p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-ink">Messages</h1>
        <p className="mt-1 text-sm text-ink/60">Open a conversation to keep things moving.</p>
      </header>

      <section className="card-soft mt-6 overflow-hidden">
        <ul className="divide-y divide-ink/10">
          {(threads || []).map((t: any) => {
            const other = t.client_id === user.id ? t.creative : t.client;
            const initials = ((other?.full_name as string) || "?")
              .split(" ")
              .map((n: string) => n[0])
              .slice(0, 2)
              .join("")
              .toUpperCase();
            return (
              <li key={t.id}>
                <Link href={`/messages/${t.id}`} className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-wash/40">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink/85 text-sm font-medium text-paper">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-ink">{other?.full_name || "Unknown"}</p>
                    <p className="truncate text-xs text-ink/55">{timeAgo(t.created_at)}</p>
                  </div>
                </Link>
              </li>
            );
          })}
          {(!threads || threads.length === 0) && (
            <li className="px-5 py-10 text-center text-sm text-ink/55">No conversations yet.</li>
          )}
        </ul>
      </section>
    </div>
  );
}
