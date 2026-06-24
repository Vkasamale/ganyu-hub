import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { sendMessage } from "@/app/actions";
import { Input } from "@/components/ui/input";
import { SavingForm, SubmitButton } from "@/components/saving-form";
import { timeAgo } from "@/lib/utils";

export default async function ThreadPage({ params }: { params: { threadId: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: thread } = await supabase.from("message_threads").select("*").eq("id", params.threadId).single();
  if (!thread) notFound();
  const { data: messages } = await supabase.from("messages").select("*").eq("thread_id", params.threadId).order("created_at", { ascending: true });

  return (
    <div className="mx-auto flex max-w-2xl flex-col px-4 py-8" style={{ minHeight: "calc(100vh - 4rem)" }}>
      <div className="flex-1 space-y-3 overflow-y-auto">
        {(messages || []).map((m) => {
          const mine = m.sender_id === user.id;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${mine ? "bg-brand text-white" : "bg-neutral-100"}`}>
                <p className="whitespace-pre-wrap">{m.body}</p>
                <p className={`mt-1 text-[10px] ${mine ? "text-white/70" : "text-neutral-500"}`}>{timeAgo(m.created_at)}</p>
              </div>
            </div>
          );
        })}
        {(!messages || messages.length === 0) && <p className="text-center text-neutral-500">Say hello.</p>}
      </div>
      <SavingForm action={sendMessage} resetOnSuccess successText="Sent." className="mt-4 flex gap-2">
        <input type="hidden" name="thread_id" value={thread.id} />
        <Input name="body" placeholder="Type a message" required />
        <SubmitButton pendingText="Sending…">Send</SubmitButton>
      </SavingForm>
    </div>
  );
}
