import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatMwk, timeAgo } from "@/lib/utils";

export default async function ProposalsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: sent } = await supabase
    .from("proposals")
    .select("*, job:jobs(id, title, category)")
    .eq("creative_id", user.id)
    .order("created_at", { ascending: false });

  const { data: received } = await supabase
    .from("proposals")
    .select("*, job:jobs!inner(id, title, client_id), creative:profiles!proposals_creative_id_fkey(id, full_name)")
    .eq("job.client_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-10">
      <section>
        <h2 className="text-xl font-semibold">Proposals you sent</h2>
        <div className="mt-4 space-y-3">
          {(sent || []).map((p: any) => (
            <Link key={p.id} href={`/jobs/${p.job?.id}`}>
              <Card className="transition hover:border-brand">
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">{p.job?.title}</p>
                    <p className="text-xs text-neutral-500">{timeAgo(p.created_at)} &middot; {formatMwk(p.bid_mwk)}</p>
                  </div>
                  <Badge>{p.status}</Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
          {(!sent || sent.length === 0) && <p className="text-neutral-500">None yet.</p>}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Proposals received</h2>
        <div className="mt-4 space-y-3">
          {(received || []).map((p: any) => (
            <Link key={p.id} href={`/jobs/${p.job?.id}`}>
              <Card className="transition hover:border-brand">
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">{p.job?.title}</p>
                    <p className="text-xs text-neutral-500">from {p.creative?.full_name || "Unnamed"} &middot; {formatMwk(p.bid_mwk)}</p>
                  </div>
                  <Badge>{p.status}</Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
          {(!received || received.length === 0) && <p className="text-neutral-500">None yet.</p>}
        </div>
      </section>
    </div>
  );
}
