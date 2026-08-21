import { notFound, redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/supabase/user";
import { acceptJobViaLink } from "@/app/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SavingForm, SubmitButton } from "@/components/saving-form";
import { Logo } from "@/components/logo";
import { Turnstile } from "@/components/turnstile";
import { formatMwk } from "@/lib/utils";

function admin() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

export default async function ClientLinkPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const db = admin();
  const { data: job } = await db.from("jobs")
    .select("id, title, brief, deliverables, deadline, accepted_bid_mwk, revisions_included, extra_revision_rate, client_id, client_link_token")
    .eq("client_link_token", token).maybeSingle();
  if (!job) notFound();

  if (job.client_id) {
    const supabase = createClient();
    const user = await getSessionUser();
    if (user && user.id === job.client_id) redirect(`/jobs/${job.id}`);
  }

  const { data: creativeProposal } = await db.from("proposals")
    .select("creative_id").eq("job_id", job.id).eq("status", "accepted").maybeSingle();
  const { data: creative } = creativeProposal
    ? await db.from("profiles").select("full_name, headline, avatar_url, location").eq("id", creativeProposal.creative_id).single()
    : { data: null } as any;

  const claimed = !!job.client_id;

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:py-16">
      <div className="mb-8 flex items-center justify-center gap-2">
        <Logo />
        <span className="text-sm font-medium text-ink/70">Ganyu Hub</span>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <p className="text-xs uppercase tracking-wide text-ink/50">A job for you</p>
          <CardTitle className="mt-1">{job.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {creative && (
            <div className="flex items-center gap-3 rounded-md border border-ink/10 bg-raised p-3">
              {creative.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={creative.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover" />
              ) : (
                <div className="h-10 w-10 rounded-full bg-ink/10" />
              )}
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{creative.full_name}</div>
                <div className="truncate text-xs text-ink/60">
                  {creative.headline || "Creative on Ganyu Hub"}
                  {creative.location ? ` · ${creative.location}` : ""}
                </div>
              </div>
            </div>
          )}

          <div>
            <div className="text-xs uppercase tracking-wide text-ink/50">Agreed price</div>
            <div className="text-2xl font-semibold">{formatMwk(job.accepted_bid_mwk || 0)}</div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wide text-ink/50">Brief</div>
            <p className="mt-1 whitespace-pre-wrap text-sm text-ink/80">{job.brief}</p>
          </div>

          {job.deliverables && (
            <div>
              <div className="text-xs uppercase tracking-wide text-ink/50">Deliverables</div>
              <p className="mt-1 whitespace-pre-wrap text-sm text-ink/80">{job.deliverables}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 text-sm">
            {job.deadline && (
              <div>
                <div className="text-xs uppercase tracking-wide text-ink/50">Deadline</div>
                <div>{job.deadline}</div>
              </div>
            )}
            <div>
              <div className="text-xs uppercase tracking-wide text-ink/50">Revisions included</div>
              <div>{job.revisions_included ?? 0}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {claimed ? (
        <Card>
          <CardContent className="p-6 text-center text-sm text-ink/70">
            This job has already been claimed. If it&rsquo;s yours,{" "}
            <a href="/login" className="font-semibold underline">sign in</a> to view it.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Accept this job and fund escrow</CardTitle>
            <p className="mt-1 text-sm text-ink/60">
              Create your account &mdash; takes 20 seconds. Payment happens on the next screen.
            </p>
          </CardHeader>
          <CardContent>
            <SavingForm action={acceptJobViaLink} className="space-y-4">
              <input type="hidden" name="token" value={token} />
              <div className="space-y-1.5">
                <Label htmlFor="full_name">Your name</Label>
                <Input id="full_name" name="full_name" required minLength={2} autoComplete="name" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone number</Label>
                <Input id="phone" name="phone" required type="tel" inputMode="tel" autoComplete="tel" placeholder="e.g. +265 991 234 567" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" required type="password" minLength={8} autoComplete="new-password" placeholder="At least 8 characters" />
                <p className="text-xs text-ink/50">If you already have an account with this phone, we&rsquo;ll sign you in.</p>
              </div>
              <Turnstile />
              <SubmitButton pendingText="Setting up…">Accept &amp; continue to payment</SubmitButton>
            </SavingForm>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
