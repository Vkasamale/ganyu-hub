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
import { JobPayoutMethodPicker } from "@/components/job-payout-method-picker";
import { AcceptProposalPicker } from "@/components/accept-proposal-picker";
import { ProposalPayoutPreview } from "@/components/proposal-payout-preview";
import { CancelJobPanel } from "@/components/cancel-job-panel";
import { DeadlineExtensionPanel } from "@/components/deadline-extension-panel";
import { ScopeConfirmPanel } from "@/components/scope-confirm-panel";
import { DisputePanel, DisputeBanner } from "@/components/dispute-panel";
import { submitProposal, decideProposal, recordView, addPortfolioItem, submitReview, reconcilePayout, requestTopUp, declineTopUp } from "@/app/actions";
import { StarRatingInput } from "@/components/star-rating-input";
import { Stars } from "@/components/stars";
import { formatMwk, timeAgo, formatDeadline, daysUntil } from "@/lib/utils";

export default async function JobDetailPage({ params: paramsP }: { params: Promise<{ id: string }> }) {
  const params = await paramsP;
  const supabase = createClient();
  let { data: job } = await supabase.from("jobs").select("*").eq("id", params.id).single();
  if (!job) notFound();
  // Fallback for missed payout webhooks: if this job's payout is still pending,
  // ask PayChangu directly and settle before we render. Same pattern as the
  // collection callback route. Cheap: one API call per pending-payout view.
  if (job.payout_status === "pending" && job.payout_ref) {
    await reconcilePayout(job.id);
    const { data: refreshed } = await supabase.from("jobs").select("*").eq("id", params.id).single();
    if (refreshed) job = refreshed;
  }
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

  const myProposals = !isClient && user ? (proposals || []) : [];
  const myActiveProposal = myProposals.find((p: any) => p.status === "pending" || p.status === "accepted") || null;
  const myRejectedCount = myProposals.filter((p: any) => p.status === "rejected").length;
  const myProposal = myActiveProposal || myProposals[0] || null;
  const { data: myInvite } = (user && !isClient)
    ? await supabase.from("job_invites")
        .select("id, message, status")
        .eq("job_id", job.id).eq("creative_id", user.id)
        .in("status", ["pending", "accepted"]).maybeSingle()
    : { data: null };
  const canReapply = !isClient && !!user && !myActiveProposal && (myRejectedCount < 3 || !!myInvite);
  const { data: myMethods } = (!isClient && !!user && myProposal?.status === "accepted")
    ? await supabase.from("payout_methods")
        .select("id, kind, mobile_number, mobile_network, bank_account_name, bank_account_number, is_default, label")
        .eq("user_id", user!.id).order("is_default", { ascending: false }).order("created_at", { ascending: true })
    : { data: null };

  const { count: proposalCount } = await supabase
    .from("proposals")
    .select("id", { count: "exact", head: true })
    .eq("job_id", job.id);
  const proposalLimit = (job as { proposal_limit?: number | null }).proposal_limit ?? 10;
  const isFull = (proposalCount ?? 0) >= proposalLimit;

  const isAcceptedCreative = !isClient && myProposal?.status === "accepted";
  const isParty = isClient || isAcceptedCreative;

  const CANCELLABLE_JOB_STATUSES = new Set(["in_progress", "submitted", "revision_requested"]);
  const canRequestCancel = isParty && CANCELLABLE_JOB_STATUSES.has(job.status);
  const canProposeExtension = isParty && CANCELLABLE_JOB_STATUSES.has(job.status);

  const topupJobStatuses = new Set(["in_progress", "submitted", "revision_requested"]);
  const topupsVisible = isParty && (topupJobStatuses.has(job.status) || (job.total_paid_mwk ?? 0) > (job.accepted_bid_mwk ?? 0));
  const { data: topups } = topupsVisible
    ? await supabase.from("payment_topups")
        .select("id, amount_mwk, reason, status, created_at, requested_by_creative_id")
        .eq("job_id", job.id).order("created_at", { ascending: false })
    : { data: null };
  const pendingTopup = (topups || []).find((t: any) => t.status === "pending") || null;

  const { data: pendingExtension } = canProposeExtension
    ? await supabase.from("deadline_extensions")
        .select("id, proposed_by, proposed_deadline, reason")
        .eq("job_id", job.id).eq("status", "pending").maybeSingle()
    : { data: null };
  let myReview: { rating: number; comment: string | null } | null = null;
  if (user && isParty && job.status === "completed") {
    const { data: r } = await supabase
      .from("reviews")
      .select("rating, comment")
      .eq("job_id", job.id)
      .eq("reviewer_id", user.id)
      .maybeSingle();
    myReview = r;
  }

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
          <p className="whitespace-pre-wrap break-words text-neutral-700">{job.brief}</p>
          {job.deliverables && (
            <div className="mt-4">
              <p className="text-sm font-medium text-ink">Deliverables</p>
              <p className="mt-1 whitespace-pre-wrap break-words text-sm text-neutral-700">{job.deliverables}</p>
            </div>
          )}
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3 text-sm">
            {job.deadline && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-neutral-500">Deadline:</span>
                <span className="font-medium">{formatDeadline(job.deadline)}</span>
                {(() => {
                  const d = daysUntil(job.deadline);
                  const label = d > 0 ? `${d} day${d === 1 ? "" : "s"} left` : d === 0 ? "due today" : `${-d} day${d === -1 ? "" : "s"} overdue`;
                  const tone = d < 0 ? "bg-red-100 text-red-800 border-red-200" : d <= 3 ? "bg-amber-100 text-amber-900 border-amber-200" : "bg-emerald-100 text-emerald-900 border-emerald-200";
                  return <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${tone}`}>{label}</span>;
                })()}
              </div>
            )}
            {job.revisions_included != null && (
              <div><span className="text-neutral-500">Revisions:</span> <span className="font-medium">{job.revisions_included}</span></div>
            )}
            {job.format_spec && (
              <div><span className="text-neutral-500">Format:</span> <span className="font-medium">{job.format_spec}</span></div>
            )}
          </div>
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

      {user && isClient && (job.status !== "open" || job.escrow_status !== "none" || job.pending_accept_proposal_id) && (
        <EscrowPanel jobId={job.id} escrowStatus={job.escrow_status || "none"} role="client" payoutStatus={job.payout_status} />
      )}
      {user && isClient && job.pending_accept_proposal_id && job.escrow_status === "payment_pending" && (
        <Card className="mt-6 border-amber-200 bg-amber-50">
          <CardContent className="p-5 text-sm text-amber-900">
            <p className="font-medium">Payment pending — this creative isn't locked in yet.</p>
            <p className="mt-1">Complete payment on PayChangu to finalise acceptance. Until then this job stays open and other proposals can still come in. Use "Cancel pending payment" below to release the hold.</p>
          </CardContent>
        </Card>
      )}
      {user && !isClient && myProposal && job.pending_accept_proposal_id === myProposal.id && job.escrow_status === "payment_pending" && (
        <Card className="mt-6 border-amber-200 bg-amber-50">
          <CardContent className="p-5 text-sm text-amber-900">
            <p className="font-medium">The client started payment for your proposal.</p>
            <p className="mt-1">Nothing is locked in until PayChangu confirms the payment. You'll be notified when it clears.</p>
          </CardContent>
        </Card>
      )}
      {user && !isClient && myProposal?.status === "accepted" && (
        <EscrowPanel jobId={job.id} escrowStatus={job.escrow_status || "none"} role="creative" payoutStatus={job.payout_status} />
      )}
      {user && !isClient && myProposal?.status === "accepted" && job.escrow_status !== "payment_released" && (
        <JobPayoutMethodPicker jobId={job.id} methods={myMethods || []} currentId={job.payout_method_id} />
      )}

      {user && canProposeExtension && (
        <div className="mt-4">
          <DeadlineExtensionPanel
            jobId={job.id}
            currentDeadline={job.deadline || null}
            pending={pendingExtension || null}
            currentUserId={user.id}
          />
        </div>
      )}

      {user && topupsVisible && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Payment top-ups</CardTitle>
            <p className="text-sm text-neutral-500">
              Original bid: {formatMwk(job.accepted_bid_mwk)}. Total in escrow: {formatMwk(job.total_paid_mwk ?? job.accepted_bid_mwk)}.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingTopup && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-semibold text-amber-900">
                  Pending: {formatMwk(pendingTopup.amount_mwk)}
                </p>
                {pendingTopup.reason && (
                  <p className="mt-1 whitespace-pre-wrap text-sm text-amber-900/80">"{pendingTopup.reason}"</p>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  {isClient && (
                    <>
                      <span className="text-xs text-amber-900/70 italic">Accept &amp; pay is coming in the next release.</span>
                      <SavingForm action={declineTopUp} silent>
                        <input type="hidden" name="topup_id" value={pendingTopup.id} />
                        <Button size="sm" variant="outline" type="submit">Decline</Button>
                      </SavingForm>
                    </>
                  )}
                  {!isClient && user.id === pendingTopup.requested_by_creative_id && (
                    <SavingForm action={declineTopUp} silent>
                      <input type="hidden" name="topup_id" value={pendingTopup.id} />
                      <Button size="sm" variant="outline" type="submit">Withdraw request</Button>
                    </SavingForm>
                  )}
                </div>
              </div>
            )}

            {!pendingTopup && !isClient && isAcceptedCreative && topupJobStatuses.has(job.status) && (
              <SavingForm action={requestTopUp} successText="Top-up requested." className="space-y-3">
                <input type="hidden" name="job_id" value={job.id} />
                <div className="space-y-1.5">
                  <Label htmlFor="amount_mwk">Extra amount (MWK)</Label>
                  <Input id="amount_mwk" name="amount_mwk" type="number" min={1} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="reason">Why the extra?</Label>
                  <Textarea id="reason" name="reason" required minLength={20} rows={3} placeholder="Explain the added scope: what changed, what you'll deliver for it." />
                </div>
                <SubmitButton pendingText="Sending…">Request top-up</SubmitButton>
              </SavingForm>
            )}

            {(topups || []).filter((t: any) => t.status !== "pending").length > 0 && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">History</p>
                <ul className="mt-2 space-y-1 text-sm">
                  {(topups || []).filter((t: any) => t.status !== "pending").map((t: any) => (
                    <li key={t.id} className="flex flex-wrap items-center gap-2 rounded-md border border-ink/10 bg-paper px-3 py-2">
                      <span className="font-medium">{formatMwk(t.amount_mwk)}</span>
                      <span className="text-xs text-neutral-500">·</span>
                      <span className="text-xs capitalize text-neutral-600">{t.status}</span>
                      <span className="text-xs text-neutral-500">· {timeAgo(t.created_at)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {user && canRequestCancel && (
        <div className="mt-4">
          <CancelJobPanel jobId={job.id} />
        </div>
      )}

      {job.status === "cancellation_requested" && (
        <Card className="mt-4 border-amber-300 bg-amber-50">
          <CardContent className="p-4 text-sm text-amber-900">
            <p className="font-medium">Cancellation requested — awaiting admin review.</p>
            {job.cancellation_reason && (
              <p className="mt-1 text-amber-900/80">Reason: {job.cancellation_reason}</p>
            )}
          </CardContent>
        </Card>
      )}

      {user && isParty && job.status === "completed" && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>{myReview ? "Your review" : `Rate ${isClient ? "the creative" : "the client"}`}</CardTitle>
            <p className="text-sm text-neutral-500">
              {myReview
                ? "Thanks for the feedback — it helps others on Ganyu Hub."
                : "How was working together? Your review appears on their profile and builds trust for future jobs."}
            </p>
          </CardHeader>
          <CardContent>
            {myReview ? (
              <div>
                <Stars value={myReview.rating} className="h-5 w-5" />
                {myReview.comment && (
                  <p className="mt-2 whitespace-pre-wrap text-sm text-neutral-700">{myReview.comment}</p>
                )}
              </div>
            ) : (
              <SavingForm action={submitReview} successText="Review submitted. Thanks!" className="space-y-4">
                <input type="hidden" name="job_id" value={job.id} />
                <div className="space-y-1.5">
                  <Label>Rating</Label>
                  <StarRatingInput name="rating" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="comment">Comment (optional)</Label>
                  <Textarea id="comment" name="comment" rows={3} placeholder="What was it like to work with them?" />
                </div>
                <SubmitButton pendingText="Submitting…">Submit review</SubmitButton>
              </SavingForm>
            )}
          </CardContent>
        </Card>
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

      {user && !isClient && !myActiveProposal && isFull && myRejectedCount === 0 && (
        <Card className="mt-6 border-neutral-300 bg-neutral-50">
          <CardContent className="p-6">
            <p className="text-sm font-semibold">This job is full.</p>
            <p className="mt-1 text-sm text-neutral-600">
              It has reached its cap of {proposalLimit} proposals. Try another job.
            </p>
          </CardContent>
        </Card>
      )}

      {user && !isClient && !myActiveProposal && myRejectedCount >= 3 && !myInvite && (
        <Card className="mt-6 border-neutral-300 bg-neutral-50">
          <CardContent className="p-6">
            <p className="text-sm font-semibold">You've used all 3 attempts on this job.</p>
            <p className="mt-1 text-sm text-neutral-600">
              Only a direct invite from the client can reopen it.
            </p>
          </CardContent>
        </Card>
      )}

      {user && !isClient && myInvite && !myActiveProposal && (
        <Card className="mt-6 border-emerald-300 bg-emerald-50">
          <CardContent className="p-5">
            <p className="text-sm font-semibold text-emerald-900">You've been invited to apply.</p>
            {myInvite.message && (
              <p className="mt-1 whitespace-pre-wrap text-sm text-emerald-900/80">"{myInvite.message}"</p>
            )}
            <p className="mt-2 text-xs text-emerald-900/70">This invite lets you submit a proposal regardless of prior attempts.</p>
          </CardContent>
        </Card>
      )}

      {user && canReapply && !isFull && (
        <Card className="mt-6">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle>
                {myRejectedCount > 0 ? `Send another proposal (attempt ${myRejectedCount + 1} of 3)` : "Send a proposal"}
              </CardTitle>
              <p className="text-xs text-neutral-500">
                {proposalCount ?? 0} of {proposalLimit} proposals
              </p>
            </div>
            {myRejectedCount > 0 && (
              <p className="text-xs text-neutral-500">
                Your previous {myRejectedCount === 1 ? "proposal was" : `${myRejectedCount} proposals were`} rejected. You have {3 - myRejectedCount} {3 - myRejectedCount === 1 ? "attempt" : "attempts"} left.
              </p>
            )}
          </CardHeader>
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
              <ProposalPayoutPreview />
              <SubmitButton pendingText="Sending…">Submit proposal</SubmitButton>
            </SavingForm>
          </CardContent>
        </Card>
      )}

      {user && !isClient && myActiveProposal && (
        <Card className="mt-6">
          <CardContent className="p-6">
            <p className="font-semibold">
              You have sent a proposal &middot;{" "}
              <span className="text-neutral-500 font-normal">{myActiveProposal.status}</span>
            </p>
            <p className="mt-2 text-sm text-neutral-700 whitespace-pre-wrap">{myActiveProposal.cover_letter}</p>
            <p className="mt-2 text-sm">Bid: {formatMwk(myActiveProposal.bid_mwk)}</p>
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
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <AcceptProposalPicker proposalId={p.id} bidMwk={p.bid_mwk} />
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
