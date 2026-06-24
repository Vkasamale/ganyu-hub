import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
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
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">Messages</h1>
      <div className="mt-6 space-y-2">
        {(threads || []).map((t: any) => {
          const other = t.client_id === user.id ? t.creative : t.client;
          return (
            <Link key={t.id} href={`/messages/${t.id}`}>
              <Card className="transition hover:border-brand">
                <CardContent className="flex items-center justify-between p-4">
                  <p className="font-medium">{other?.full_name || "Unknown"}</p>
                  <p className="text-xs text-neutral-500">{timeAgo(t.created_at)}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
        {(!threads || threads.length === 0) && <p className="text-neutral-500">No conversations yet.</p>}
      </div>
    </div>
  );
}
