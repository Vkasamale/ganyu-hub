import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { sendMessage } from "@/app/actions";
import { Input } from "@/components/ui/input";
import { SavingForm, SubmitButton } from "@/components/saving-form";
import { AttachmentPicker } from "@/components/attachment-picker";
import { MessageAttachment } from "@/components/message-attachment";
import { timeAgo } from "@/lib/utils";

export default async function ThreadPage({ params: paramsP }: { params: Promise<{ threadId: string }> }) {
  const params = await paramsP;
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: thread } = await supabase
    .from("message_threads")
    .select("*, client:profiles!message_threads_client_id_fkey(id, full_name), creative:profiles!message_threads_creative_id_fkey(id, full_name)")
    .eq("id", params.threadId)
    .single();
  if (!thread) notFound();

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("thread_id", params.threadId)
    .order("created_at", { ascending: true });

  // Attachments live in a private bucket. New rows store the object path; mint
  // short-lived signed URLs here (RLS limits this to thread participants).
  // Legacy rows may hold a full public URL — pass those through unchanged.
  const attachmentPaths = (messages || [])
    .map((m: any) => m.attachment_url as string | null)
    .filter((u): u is string => !!u && !u.startsWith("http"));
  const signedMap = new Map<string, string>();
  if (attachmentPaths.length) {
    const { data: signed } = await supabase.storage
      .from("job-files")
      .createSignedUrls(attachmentPaths, 3600);
    (signed || []).forEach((s) => {
      if (s.signedUrl && s.path) signedMap.set(s.path, s.signedUrl);
    });
  }

  const { data: threads } = await supabase
    .from("message_threads")
    .select("id, created_at, client_id, creative_id, client:profiles!message_threads_client_id_fkey(id, full_name), creative:profiles!message_threads_creative_id_fkey(id, full_name)")
    .or(`client_id.eq.${user.id},creative_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  const other: any = thread.client_id === user.id ? thread.creative : thread.client;
  const otherInitials = ((other?.full_name as string) || "?")
    .split(" ")
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="grid gap-4 md:grid-cols-[300px_minmax(0,1fr)]" style={{ height: "calc(100vh - 7rem)" }}>
        <aside className="card-soft hidden flex-col overflow-hidden md:flex">
          <div className="border-b border-ink/10 p-4">
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                aria-label="Back to dashboard"
                className="-ml-1 inline-flex h-7 w-7 items-center justify-center rounded-md text-ink/60 transition-colors hover:bg-wash/60 hover:text-ink"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </Link>
              <p className="eyebrow">Messages</p>
            </div>
            <p className="mt-1 text-xs text-ink/55">{threads?.length || 0} conversations</p>
          </div>
          <ul className="flex-1 overflow-y-auto">
            {(threads || []).map((t: any) => {
              const o = t.client_id === user.id ? t.creative : t.client;
              const active = t.id === thread.id;
              const initials = ((o?.full_name as string) || "?")
                .split(" ")
                .map((n: string) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase();
              return (
                <li key={t.id}>
                  <Link
                    href={`/messages/${t.id}`}
                    className={
                      active
                        ? "flex items-center gap-3 border-l-2 border-stamp bg-wash/50 px-4 py-3"
                        : "flex items-center gap-3 border-l-2 border-transparent px-4 py-3 transition-colors hover:bg-wash/30"
                    }
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink/85 text-xs font-medium text-paper">
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">{o?.full_name || "Unknown"}</p>
                      <p className="truncate text-xs text-ink/55">{timeAgo(t.created_at)}</p>
                    </div>
                  </Link>
                </li>
              );
            })}
            {(!threads || threads.length === 0) && (
              <li className="px-4 py-6 text-center text-xs text-ink/55">No conversations yet.</li>
            )}
          </ul>
        </aside>

        <section className="card-soft flex flex-col overflow-hidden">
          <header className="flex items-center gap-3 border-b border-ink/10 px-5 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink/85 text-xs font-medium text-paper">
              {otherInitials}
            </div>
            <div>
              <p className="font-medium text-ink">{other?.full_name || "Unknown"}</p>
              <p className="text-xs text-ink/55">Started {timeAgo(thread.created_at)}</p>
            </div>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto bg-paper/60 px-5 py-5">
            {(messages || []).map((m: any) => {
              const mine = m.sender_id === user.id;
              return (
                <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={
                      mine
                        ? "max-w-[75%] rounded-2xl rounded-br-sm bg-ink px-4 py-2.5 text-sm text-paper shadow-sm"
                        : "max-w-[75%] rounded-2xl rounded-bl-sm border border-ink/10 bg-paper px-4 py-2.5 text-sm text-ink shadow-sm"
                    }
                  >
                    {m.body && <p className="whitespace-pre-wrap">{m.body}</p>}
                    {m.attachment_url && (
                      <MessageAttachment
                        url={m.attachment_url.startsWith("http") ? m.attachment_url : (signedMap.get(m.attachment_url) || "")}
                        name={m.attachment_name}
                        type={m.attachment_type}
                        size={m.attachment_size}
                        mine={mine}
                      />
                    )}
                    <p className={`mt-1 text-[10px] ${mine ? "text-paper/60" : "text-ink/50"}`}>{timeAgo(m.created_at)}</p>
                  </div>
                </div>
              );
            })}
            {(!messages || messages.length === 0) && (
              <p className="py-8 text-center text-sm text-ink/55">Say hello.</p>
            )}
          </div>

          <SavingForm action={sendMessage} resetOnSuccess successText="Sent." className="flex flex-wrap items-center gap-2 border-t border-ink/10 bg-paper px-5 py-4">
            <input type="hidden" name="thread_id" value={thread.id} />
            <AttachmentPicker />
            <Input name="body" placeholder="Type a message or attach a file" className="min-w-0 flex-1" />
            <SubmitButton pendingText="Sending…">Send</SubmitButton>
          </SavingForm>
        </section>
      </div>
    </div>
  );
}
