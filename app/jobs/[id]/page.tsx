import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/supabase/user";
import { formatMwk as _formatMwkMeta } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const supabase = createClient();
  const { data: job } = await supabase
    .from("jobs")
    .select("title, brief, budget_mwk, category, visibility")
    .eq("id", id)
    .single();
  if (!job) return { title: "Job — Ganyu Hub" };
  if (job.visibility === "private") {
    return {
      title: "Private invite — Ganyu Hub",
      description: "This is a private job. Sign in as the invited creative to view details.",
      robots: { index: false, follow: false },
    };
  }
  const title = `${job.title} — Ganyu Hub`;
  const budget = job.budget_mwk ? _formatMwkMeta(job.budget_mwk) : null;
  const descParts = [job.category, budget ? `Budget ${budget}` : null, job.brief?.slice(0, 140)].filter(Boolean);
  return {
    title,
    description: descParts.join(" · "),
    openGraph: { title, description: descParts.join(" · "), type: "article" },
    twitter: { card: "summary", title, description: descParts.join(" · ") },
  };
}
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible } from "@/components/collapsible";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MoneyInput } from "@/components/money-input";
import { PricingExplainer } from "@/components/pricing-explainer";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SaveButton } from "@/components/save-button";
import { SavingForm, SubmitButton } from "@/components/saving-form";
import { JobStatusPanel } from "@/components/job-status-panel";
import { JobRealtime } from "@/components/job-realtime";
import { EscrowPanel, primaryClientAction } from "@/components/escrow-panel";
import { StickyActionBar } from "@/components/sticky-action-bar";
import { AboutClient } from "@/components/about-client";
import { getClientTrust } from "@/lib/client-trust";
import { isTestMode } from "@/lib/payments";
import { ClientLinkCopy } from "@/components/client-link-copy";
import { JobHeader } from "@/components/job-header";
import { ShareButtons } from "@/components/share-buttons";
import { absUrl } from "@/lib/site-url";
import { JobPayoutMethodPicker } from "@/components/job-payout-method-picker";
import { AcceptProposalPicker } from "@/components/accept-proposal-picker";
import { ProposalPayoutPreview } from "@/components/proposal-payout-preview";
import { CancelJobPanel } from "@/components/cancel-job-panel";
import { DeadlineExtensionPanel } from "@/components/deadline-extension-panel";
import { ScopeConfirmPanel } from "@/components/scope-confirm-panel";
import { DisputePanel, DisputeBanner } from "@/components/dispute-panel";
import { JobTimeline, type JobEventRow } from "@/components/job-timeline";
import { JobDeliverySubmit } from "@/components/job-delivery-submit";
import { RequestRevisionPanel } from "@/components/request-revision-panel";
import { Select } from "@/components/ui/select";
import { submitProposal, decideProposal, recordView, addPortfolioItem, submitReview, reconcilePayout, requestTopUp, declineTopUp, payTopUp } from "@/app/actions";
import { collectionFee } from "@/lib/fees";
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
    await reconcilePayout(job.id, { skipRevalidate: true });
    const { data: refreshed } = await supabase.from("jobs").select("*").eq("id", params.id).single();
    if (refreshed) job = refreshed;
  }
  const { data: client } = job.client_id
    ? await supabase.from("profiles").select("id, full_name").eq("id", job.client_id).single()
    : { data: null as { id: string; full_name: string | null } | null };
  const user = await getSessionUser();
  const isClient = !!(user && job.client_id && user.id === job.client_id);
  if (job.visibility === "private" && !isClient) {
    if (!user) notFound();
    // Session 5: unclaimed creative-initiated jobs — the creative on the
    // synthetic accepted proposal must be able to see and manage the job.
    const { data: myAcceptedProposal } = await supabase.from("proposals")
      .select("id").eq("job_id", job.id).eq("creative_id", user.id).eq("status", "accepted").maybeSingle();
    if (!myAcceptedProposal) {
      const { data: inv } = await supabase.from("job_invites")
        .select("id").eq("job_id", job.id).eq("creative_id", user.id).maybeSingle();
      if (!inv) notFound();
    }
  }
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
  const myRejectedCount = myProposals.filter((p: any) => p.status === "declined").length;
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

  // Timeline events (session 1). RLS on job_events already restricts to
  // client/accepted-creative/admin; the isParty gate here just avoids the
  // roundtrip when a non-party lands on the page. metadata carries delivery
  // attachments (file_url path OR external_link).
  const isAcceptedCreativeForEvents = !isClient && myProposal?.status === "accepted";
  const isPartyForEvents = isClient || isAcceptedCreativeForEvents;
  const { data: jobEvents } = isPartyForEvents
    ? await supabase.from("job_events")
        .select("id, event_type, note, created_at, metadata")
        .eq("job_id", job.id)
        .order("created_at", { ascending: true })
    : { data: null };

  // Session 3: batch-sign download URLs for any uploaded deliveries. RLS on
  // the job-deliverables bucket enforces the same client/accepted-creative
  // read scope, so this only returns signed URLs the current user is allowed
  // to have. 1h expiry — timeline reloads on any navigation.
  const signedUrls: Record<string, string> = {};
  const deliveryPaths = (jobEvents || [])
    .map((e: any) => e?.metadata?.file_url)
    .filter((p: any): p is string => typeof p === "string" && p.length > 0);
  if (deliveryPaths.length > 0) {
    const { data: signed } = await supabase.storage
      .from("job-deliverables")
      .createSignedUrls(deliveryPaths, 3600);
    for (const s of signed || []) {
      if (s.path && s.signedUrl) signedUrls[s.path] = s.signedUrl;
    }
  }

  // Delivery form is creative-only, visible while the job is active enough
  // to be delivered. Same status set the server action enforces.
  const DELIVERY_ACTIVE = new Set(["in_progress", "revision_requested", "submitted"]);
  const canSubmitDelivery = isAcceptedCreativeForEvents && DELIVERY_ACTIVE.has(job.status);

  // The job's conversation, if one exists — created on acceptance. Only the two
  // parties have one, and RLS already restricts the read to them.
  const { data: jobThread } = user
    ? await supabase.from("message_threads").select("id").eq("job_id", job.id).maybeSingle()
    : { data: null };

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
  // This panel exists for top-ups the CREATIVE requested, which the client
  // accepts and pays. An extra revision is the client's own charge, paid
  // through its own redirect — surfacing it here asks them to approve their
  // own request. requested_by_creative_id can't tell them apart (it names the
  // creative either way), so the EXTRA_REVISION marker in `reason` is the only
  // discriminator — the same one the callback and webhook key on.
  const pendingTopup = (topups || []).find(
    (t: any) => t.status === "pending" && !String(t.reason || "").startsWith("EXTRA_REVISION|")
  ) || null;

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

  const showClientLink = !job.client_id && !!job.client_link_token && isAcceptedCreative;

  // Item 24. Only for people who are NOT the client: this block exists to help
  // someone decide whether to bid, and a client does not need telling how many
  // jobs they have posted. Skipped entirely for unclaimed creative-made jobs,
  // where client_id is still null.
  const clientTrust = user && !isClient && job.client_id ? await getClientTrust(supabase, job.client_id) : null;

  // Mobile sticky bar: only when the payment card is actually on the page and
  // the client has a money action waiting. Same label source as the button it
  // scrolls to, so the two can never drift apart.
  const paymentCardShown =
    !!user && isClient && (job.status !== "open" || job.escrow_status !== "none" || !!job.pending_accept_proposal_id);
  const stickyLabel = paymentCardShown
    ? primaryClientAction(job.escrow_status || "none", job.total_paid_mwk ?? job.accepted_bid_mwk ?? null)
    : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      {user && <JobRealtime jobId={job.id} />}
      <Link href="/jobs" className="text-sm text-neutral-500 hover:underline">
        All jobs
      </Link>
      {showClientLink && (
        <div className="mt-4">
          <ClientLinkCopy token={job.client_link_token!} />
        </div>
      )}
      <div className="mt-4">
        <JobHeader
          job={job}
          events={jobEvents || []}
          right={
            <>
              <Badge>{job.category}</Badge>
              <Badge className="bg-white">{(job.status || "open").replace("_", " ")}</Badge>
              {user && !isClient && <SaveButton targetType="job" targetId={job.id} saved={isSaved} />}
            </>
          }
        />
        <p className="mt-2 px-1 text-sm text-neutral-500">
          Posted by{" "}
          {job.client_id ? (
            <Link
              href={`/creatives/${job.client_id}`}
              className="font-medium text-stamp-dark underline decoration-stamp/40 underline-offset-4 hover:decoration-stamp"
            >
              {client?.full_name || "a client"}
            </Link>
          ) : (
            client?.full_name || "a client"
          )}{" "}
          &middot; {timeAgo(job.created_at)}
        </p>
      </div>

      {clientTrust && (
        <AboutClient trust={clientTrust} clientId={job.client_id} clientName={client?.full_name || null} />
      )}

      {/* Payment sits directly under the header. It's the most important thing
          on the page and it used to be a long scroll down. heldMwk feeds the
          §N4 amount-in-the-button labels, not just the creative's payout note. */}
      {user && isClient && (job.status !== "open" || job.escrow_status !== "none" || job.pending_accept_proposal_id) && (
        <div id="payment" className="scroll-mt-24">
        <EscrowPanel jobId={job.id} escrowStatus={job.escrow_status || "none"} role="client" payoutStatus={job.payout_status} heldMwk={job.total_paid_mwk ?? job.accepted_bid_mwk ?? null} paymentHeldAt={job.payment_held_at} testMode={isTestMode()} />
        </div>
      )}
      {user && isClient && job.pending_accept_proposal_id && job.escrow_status === "payment_pending" && (
        <Card className="mt-6 border-amber-200 bg-amber-50">
          <CardContent className="p-5 text-sm text-amber-900">
            <p className="font-medium">Payment pending — this creative isn't locked in yet.</p>
            <p className="mt-1">Complete the checkout to finalise acceptance. Until then this job stays open and other proposals can still come in. Use "Cancel pending payment" above to release the hold.</p>
          </CardContent>
        </Card>
      )}
      {user && !isClient && myProposal && job.pending_accept_proposal_id === myProposal.id && job.escrow_status === "payment_pending" && (
        <Card className="mt-6 border-amber-200 bg-amber-50">
          <CardContent className="p-5 text-sm text-amber-900">
            <p className="font-medium">The client started payment for your proposal.</p>
            <p className="mt-1">Nothing is locked in until the payment confirms. You'll be notified when it clears.</p>
          </CardContent>
        </Card>
      )}
      {user && !isClient && myProposal?.status === "accepted" && (
        <EscrowPanel jobId={job.id} escrowStatus={job.escrow_status || "none"} role="creative" payoutStatus={job.payout_status} heldMwk={job.total_paid_mwk ?? job.accepted_bid_mwk ?? null} paymentHeldAt={job.payment_held_at} testMode={isTestMode()} />
      )}
      {user && !isClient && myProposal?.status === "accepted" && job.escrow_status !== "payment_released" && (
        <JobPayoutMethodPicker jobId={job.id} methods={myMethods || []} currentId={job.payout_method_id} />
      )}

      <Card className="mt-4">
        <CardContent className="p-5 sm:p-6">
          {/* Brief collapses to a teaser; the terms below stay visible, since
              budget and deadline are what people come back to check. */}
          <Collapsible
            title="Project brief"
            summary={String(job.brief || "").slice(0, 110) + (String(job.brief || "").length > 110 ? "…" : "")}
          >
            <p className="whitespace-pre-wrap break-words font-serif text-lg leading-relaxed text-ink/85 sm:text-xl">
              {job.brief}
            </p>

            {job.deliverables && (
              <div className="mt-6 border-t border-ink/10 pt-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/45">
                  Deliverables
                </div>
                <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-ink/80">
                  {job.deliverables}
                </p>
              </div>
            )}
          </Collapsible>

          <dl className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-ink/10 pt-4 text-sm">
            {(() => {
              // Terms drift during a job (paid top-ups, extra revisions). Show
              // the CURRENT figure as the headline with the original struck
              // beside it, so nobody has to remember what was agreed.
              const agreed = job.accepted_bid_mwk ?? null;
              const paid = job.total_paid_mwk ?? null;
              const changed = agreed != null && paid != null && paid !== agreed;
              return (
                <div className="flex items-baseline gap-2">
                  <dt className="text-xs uppercase tracking-wide text-ink/50">Budget</dt>
                  <dd className="font-display text-base font-medium tabular-nums text-ink">
                    {formatMwk(changed ? paid : agreed ?? job.budget_mwk)}
                  </dd>
                  {changed && (
                    <span className="text-xs text-ink/50">
                      <s className="tabular-nums">{formatMwk(agreed)}</s> originally
                    </span>
                  )}
                </div>
              );
            })()}
            {job.deadline && (
              <div className="flex items-center gap-2">
                <dt className="text-xs uppercase tracking-wide text-ink/50">Deadline</dt>
                <dd className="font-medium text-ink">{formatDeadline(job.deadline)}</dd>
                {(() => {
                  const d = daysUntil(job.deadline);
                  const label = d > 0 ? `${d} day${d === 1 ? "" : "s"} left` : d === 0 ? "due today" : `${-d} day${d === -1 ? "" : "s"} overdue`;
                  const tone = d < 0 ? "bg-red-100 text-red-800 border-red-200" : d <= 3 ? "bg-amber-100 text-amber-900 border-amber-200" : "bg-emerald-100 text-emerald-900 border-emerald-200";
                  return <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${tone}`}>{label}</span>;
                })()}
                {job.original_deadline && job.original_deadline !== job.deadline && (
                  <span className="text-xs text-ink/50">
                    <s>{formatDeadline(job.original_deadline)}</s> originally
                  </span>
                )}
              </div>
            )}
            {job.revisions_included != null && (() => {
              // Never render "2 of 1" — a used count can exceed the included
              // count once extras are paid for, which reads as a mistake.
              // Show the included allowance plus purchased extras separately.
              const included = Number(job.revisions_included ?? 0);
              const used = Number(job.revisions_used ?? 0);
              const extra = Math.max(0, used - included);
              return (
                <div className="flex items-baseline gap-2">
                  <dt className="text-xs uppercase tracking-wide text-ink/50">Revisions</dt>
                  <dd className="font-medium text-ink">
                    {Math.min(used, included)} of {included}
                  </dd>
                  {extra > 0 && (
                    <span className="rounded-full border border-stamp/30 bg-stamp/10 px-2 py-0.5 text-xs font-medium text-stamp-dark">
                      +{extra} extra purchased
                    </span>
                  )}
                </div>
              );
            })()}
            {job.format_spec && (
              <div className="flex items-baseline gap-2">
                <dt className="text-xs uppercase tracking-wide text-ink/50">Format</dt>
                <dd className="font-medium text-ink">{job.format_spec}</dd>
              </div>
            )}
          </dl>

          {/* Share at the foot of the brief — you share a job after reading it,
              not before. Mirrors the creative profile card. */}
          <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-ink/10 pt-4">
            <span className="text-xs uppercase tracking-wide text-ink/50">Share this job</span>
            <div className="sm:ml-auto">
              <ShareButtons
                url={absUrl(`/jobs/${job.id}`)}
                title={`${job.title} — job on Ganyu Hub`}
                text={`${job.title} — a job on Ganyu Hub`}
              />
            </div>
          </div>
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

      {isPartyForEvents && jobThread && (
        <Link
          href={`/messages/${jobThread.id}`}
          className="mt-4 inline-flex items-center gap-2 text-sm text-ink/70 underline-offset-2 hover:text-ink hover:underline"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          Open conversation
        </Link>
      )}

      {isPartyForEvents && jobEvents && jobEvents.length > 0 && (
        <JobTimeline
          events={jobEvents as JobEventRow[]}
          signedUrls={signedUrls}
          revisionsIncluded={job.revisions_included}
          revisionsUsed={job.revisions_used}
        />
      )}

      {canSubmitDelivery && (
        <JobDeliverySubmit jobId={job.id} />
      )}

      {isClient && DELIVERY_ACTIVE.has(job.status) && (
        <RequestRevisionPanel
          jobId={job.id}
          revisionsIncluded={job.revisions_included}
          revisionsUsed={job.revisions_used ?? 0}
          extraRate={job.extra_revision_rate}
        />
      )}

      {job.status === "disputed" && (
        <DisputeBanner reason={job.dispute_reason} />
      )}
      {/* One action row: rare, deliberate things that need a click to open,
          not three standing cards competing with the money. */}
      {user && isParty && (canProposeExtension || canRequestCancel || job.status === "scope_pending") && (
        <div className="mt-4 flex flex-wrap items-start gap-2">
          {canProposeExtension && (
            <DeadlineExtensionPanel
              jobId={job.id}
              currentDeadline={job.deadline || null}
              pending={pendingExtension || null}
              currentUserId={user.id}
            />
          )}
          {isParty && <DisputePanel jobId={job.id} status={job.status || "open"} />}
          {canRequestCancel && <CancelJobPanel jobId={job.id} />}
        </div>
      )}

      {/* Closing is the last thing anyone should reach for, so it sits below
          every other action rather than above them. Creative-only, and only
          once payment has been released. */}
      {user && !isClient && myProposal?.status === "accepted" && (
        <JobStatusPanel jobId={job.id} status={job.status || "open"} role="creative" escrowStatus={job.escrow_status} />
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
                {/* Marker-carrying rows are filtered out above, so `reason`
                    here is always the creative's own words. */}
                {String(pendingTopup.reason || "").trim() && (
                  <p className="mt-1 whitespace-pre-wrap break-words text-sm text-amber-900/80">
                    &ldquo;{String(pendingTopup.reason).trim()}&rdquo;
                  </p>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  {isClient && (
                    <div className="flex flex-wrap items-end gap-2">
                      <SavingForm action={payTopUp} className="flex flex-wrap items-end gap-2">
                        <input type="hidden" name="topup_id" value={pendingTopup.id} />
                        <div className="space-y-1">
                          <Label htmlFor={`rail-${pendingTopup.id}`} className="text-xs">Pay with</Label>
                          <Select id={`rail-${pendingTopup.id}`} name="rail" className="min-w-[11rem]">
                            <option value="mobile_money">Mobile money</option>
                            <option value="card">Card</option>
                            <option value="bank_transfer">Bank transfer</option>
                          </Select>
                          <p className="text-[11px] text-amber-900/70">
                            +{formatMwk(collectionFee(pendingTopup.amount_mwk, "mobile_money"))} processing fee (3%)
                          </p>
                        </div>
                        {/* §N4: name the amount. The rail's processing fee is
                            shown on its own line above, so the button carries
                            the top-up figure itself. */}
                        <SubmitButton pendingText="Redirecting…">Accept &amp; pay {formatMwk(pendingTopup.amount_mwk)}</SubmitButton>
                      </SavingForm>
                      <SavingForm action={declineTopUp} silent>
                        <input type="hidden" name="topup_id" value={pendingTopup.id} />
                        <Button size="sm" variant="outline" type="submit">Decline</Button>
                      </SavingForm>
                    </div>
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

            {!pendingTopup && !isClient && isAcceptedCreative && topupJobStatuses.has(job.status) && job.escrow_status === "payment_held" && (
              <SavingForm action={requestTopUp} successText="Top-up requested." className="space-y-3">
                <input type="hidden" name="job_id" value={job.id} />
                <div className="space-y-1.5">
                  <Label htmlFor="amount_mwk">Extra amount (MWK)</Label>
                  <MoneyInput id="amount_mwk" name="amount_mwk" required placeholder="e.g. 20,000" />
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
            <Link href="/signup" className="text-brand-dark hover:underline">Sign up</Link> as a creative to send a proposal.
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
              <PricingExplainer audience="creative" />
              <div className="space-y-1.5">
                <Label htmlFor="cover_letter">Cover letter</Label>
                <Textarea id="cover_letter" name="cover_letter" required rows={5} placeholder="Why are you the right creative for this job?" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bid_mwk">Your bid (MWK)</Label>
                <MoneyInput id="bid_mwk" name="bid_mwk" required placeholder="e.g. 100,000" />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="revisions_offered">Revisions included</Label>
                  <Input id="revisions_offered" name="revisions_offered" type="number" min={0} max={20} defaultValue={1} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="extra_revision_rate">Extra revision rate (MWK, optional)</Label>
                  <MoneyInput id="extra_revision_rate" name="extra_revision_rate" placeholder="leave blank for hard limit" />
                </div>
              </div>
              <p className="text-xs text-ink/55">Leave the rate blank to make the included revisions a hard limit — clients won't be able to request more.</p>
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
                      <AcceptProposalPicker proposalId={p.id} bidMwk={p.bid_mwk} testMode={isTestMode()} />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            {(!proposals || proposals.length === 0) && <p className="text-neutral-500">No proposals yet.</p>}
          </div>
        </section>
      )}

      {/* §G1: on a phone the payment card scrolls away immediately. The bar
          names the amount and jumps back to the real button. */}
      {stickyLabel && <StickyActionBar href="#payment" label={stickyLabel} hint={job.title} />}
    </div>
  );
}
