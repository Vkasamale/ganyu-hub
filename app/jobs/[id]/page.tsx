import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SaveButton } from "@/components/save-button";
import { SavingForm, SubmitButton } from "@/components/saving-form";
import { JobStatusPanel } from "@/components/job-status-panel";
import { JobRealtime } from "@/components/job-realtime";
import { EscrowPanel } from "@/components/escrow-panel";
import { ScopeConfirmPanel } from "@/components/scope-confirm-panel";
import { DisputePanel, DisputeBanner } from "@/components/dispute-panel";
import { submitProposal, decideProposal, recordView, addPortfolioItem } from "@/app/actions";
import { formatMwk, timeAgo } from "@/lib/utils";

export default async function JobDetailPage({ params: paramsP }: { params: Promise<{ id: string }> }) {
  const params = await paramsP;
  const supabase = createClient();
  const { data: job } = await supabase.from("jobs").select("*").eq("id", params.id).single();
  if (!job) notFound();
  const { data: client } = await supabase.from("profiles").select("id, full_name").eq("id", job.client_id).single();
  const { data: { user } } = await supabase.auth.getUser();
  const isClient = user?.id === job.client_id;
  if (user && !isClient) await recordView("job", params.id);
  let isSaved = false;
  if (user && !isClient) {
    const { data: s } = await supabase.from("saved_items").select("id").eq("user_id", user.id).eq("target_type", "job").eq("target_id", params.id).maybeSingle();
    isSaved = !!s;
  }

  const { data: proposals } = isClient
    ? await supabase
        .from("proposals")
        .select("*, creative:profiles!proposals_creative_id_fkey(id, full_name, headline)")
        .eq("job_id", job.id)
        .order("created_at", { ascending: false })
    : await supabase
        .from("proposals")
        .select("*")
        .eq("job_id", job.id)
        .eq("creative_id", user?.id || "")
        .order("created_at", { ascending: false });

  const myProposal = !isClient && user ? (proposals || [])[0] : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      {user && <JobRealtime jobId={job.id} />}
      <Link href="/jobs" className="text-sm text-neutral-500 hover:underline">
        All jobs
      </Link>
      <Card className="mt-4">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="text-2xl">{job.title}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge>{job.category}</Badge>
              <Badge className="bg-white">{(job.status || "open").replace("_", " ")}</Badge>
              {user && !isClient && <SaveButton targetType="job" targetId={job.id} saved={isSaved} />}
            </div>
          </div>
          <p className="text-sm text-neutral-500">
            Posted by {client?.full_name || "a client"} &middot; {timeAgo(job.created_at)}
          </p>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-neutral-700">{job.brief}</p>
          <p className="mt-4 font-semibold">Budget: {formatMwk(job.budget_mwk)}</p>
        </CardContent>
      </Card>

      {user && job.status === "scope_pending" && isClient && (
        <ScopeConfirmPanel
          jobId={job.id}
          role="client"
          summary={job.scope_summary}
          clientConfirmedAt={job.client_confirmed_scope_at}
          creativeConfirmedAt={job.creative_confirmed_scope_at}
        />
      )}
      {user && job.status === "scope_pending" && !isClient && myProposal?.status === "accepted" && (
        <ScopeConfirmPanel
          jobId={job.id}
          role="creative"
          summary={job.scope_summary}
          clientConfirmedAt={job.client_confirmed_scope_at}
          creativeConfirmedAt={job.creative_confirmed_scope_at}
        />
      )}

      {user && isClient && (
        <JobStatusPanel jobId={job.id} status={job.status || "open"} role="client" />
      )}
      {user && !isClient && myProposal?.status === "accepted" && (
        <JobStatusPanel jobId={job.id} status={job.status || "open"} role="creative" />
      )}

      {job.status === "disputed" && (
        <DisputeBanner reason={job.dispute_reason} />
      )}
      {user && isClient && (
        <DisputePanel jobId={job.id} status={job.status || "open"} />
      )}
      {user && !isClient && myProposal?.status === "accepted" && (
        <DisputePanel jobId={job.id} status={job.status || "open"} />
      )}

      {user && isClient && job.status !== "open" && (
        <EscrowPanel jobId={job.id} escrowStatus={job.escrow_status || "none"} role="client" />
      )}
      {user && !isClient && myProposal?.status === "accepted" && (
        <EscrowPanel jobId={job.id} escrowStatus={job.escrow_status || "none"} role="creative" />
      )}

      {user && !isClient && myProposal?.status === "accepted" && job.status === "completed" && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Add this work to your portfolio</CardTitle>
            <p className="text-sm text-neutral-500">Great work deserves to be shown. Upload a cover image, link the project, and let future clients see what you can do.</p>
          </CardHeader>
          <CardContent>
            <SavingForm action={addPortfolioItem} successText="Added to your portfolio." resetOnSuccess className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" required defaultValue={job.title} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" rows={3} placeholder="What did you deliver? What was the result?" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cover_url">Cover image URL</Label>
                <Input id="cover_url" name="cover_url" type="url" placeholder="https://..." />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="project_url">Project URL</Label>
                <Input id="project_url" name="project_url" type="url" placeholder="https://..." />
              </div>
              <SubmitButton pendingText="Adding…">Add to portfolio</SubmitButton>
            </SavingForm>
          </CardContent>
        </Card>
      )}

      {!user && (
        <Card className="mt-6">
          <CardContent className="p-6">
            <Link href="/signup" className="text-brand hover:underline">Sign up</Link> as a creative to send a proposal.
          </CardContent>
        </Card>
      )}

      {user && !isClient && !myProposal && (
        <Card className="mt-6">
          <CardHeader><CardTitle>Send a proposal</CardTitle></CardHeader>
          <CardContent>
            <SavingForm action={submitProposal} successText="Proposal sent." className="space-y-4">
              <input type="hidden" name="job_id" value={job.id} />
              <div className="space-y-1.5">
                <Label htmlFor="cover_letter">Cover letter</Label>
                <Textarea id="cover_letter" name="cover_letter" required rows={5} placeholder="Why are you the right creative for this job?" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bid_mwk">Your bid (MWK)</Label>
                <Input id="bid_mwk" name="bid_mwk" type="number" min={0} required />
              </div>
              <SubmitButton pendingText="Sending…">Submit proposal</SubmitButton>
            </SavingForm>
          </CardContent>
        </Card>
      )}

      {user && !isClient && myProposal && (
        <Card className="mt-6">
          <CardContent className="p-6">
            <p className="font-semibold">
              You have sent a proposal &middot;{" "}
              <span className="text-neutral-500 font-normal">{myProposal.status}</span>
            </p>
            <p className="mt-2 text-sm text-neutral-700 whitespace-pre-wrap">{myProposal.cover_letter}</p>
            <p className="mt-2 text-sm">Bid: {formatMwk(myProposal.bid_mwk)}</p>
          </CardContent>
        </Card>
      )}

      {isClient && (
        <section className="mt-8">
          <h2 className="text-xl font-semibold">Proposals ({proposals?.length || 0})</h2>
          <div className="mt-4 space-y-4">
            {(proposals || []).map((p: any) => (
              <Card key={p.id}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <Link href={`/creatives/${p.creative?.id}`} className="font-semibold hover:underline">
                      {p.creative?.full_name || "Unnamed"}
                    </Link>
                    <Badge>{p.status}</Badge>
                  </div>
                  <p className="text-sm text-neutral-500">{p.creative?.headline}</p>
                  <p className="mt-3 whitespace-pre-wrap text-sm text-neutral-700">{p.cover_letter}</p>
                  <p className="mt-2 text-sm font-medium">Bid: {formatMwk(p.bid_mwk)}</p>
                  {p.status === "pending" && (
                    <div className="mt-3 flex gap-2">
                      <form action={decideProposal}>
                        <input type="hidden" name="proposal_id" value={p.id} />
                        <input type="hidden" name="status" value="accepted" />
                        <Button size="sm" type="submit">Accept</Button>
                      </form>
                      <form action={decideProposal}>
                        <input type="hidden" name="proposal_id" value={p.id} />
                        <input type="hidden" name="status" value="declined" />
                        <Button size="sm" variant="outline" type="submit">Decline</Button>
                      </form>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            {(!proposals || proposals.length === 0) && <p className="text-neutral-500">No proposals yet.</p>}
          </div>
        </section>
      )}
    </div>
  );
}
