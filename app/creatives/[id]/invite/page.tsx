import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SavingForm, SubmitButton } from "@/components/saving-form";
import { CharCountTextarea } from "@/components/char-count-textarea";
import { inviteCreative, sendInviteWithNewJob } from "@/app/actions";
import { CATEGORIES } from "@/lib/types";

export default async function InviteCreativePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/creatives/${id}/invite`);
  if (user.id === id) redirect(`/creatives/${id}`);

  const { data: profile } = await supabase.from("profiles").select("id, full_name").eq("id", id).single();
  if (!profile) notFound();

  const { data: myOpenJobs } = await supabase
    .from("jobs").select("id, title")
    .eq("client_id", user.id).eq("status", "open")
    .order("created_at", { ascending: false });

  let inviteableJobs: { id: string; title: string; alreadyInvited: boolean }[] = [];
  if (myOpenJobs && myOpenJobs.length > 0) {
    const jobIds = myOpenJobs.map((j) => j.id);
    const { data: existing } = await supabase
      .from("job_invites").select("job_id")
      .in("job_id", jobIds).eq("creative_id", id).in("status", ["pending", "accepted"]);
    const invitedSet = new Set((existing || []).map((r) => r.job_id));
    inviteableJobs = myOpenJobs.map((j) => ({ id: j.id, title: j.title, alreadyInvited: invitedSet.has(j.id) }));
  }

  const name = profile.full_name || "creative";

  return (
    <div className="mx-auto max-w-xl px-4 py-10 space-y-8">
      <div>
        <Link href={`/creatives/${id}`} className="text-sm text-ink/60 hover:text-ink">← Back to profile</Link>
        <h1 className="mt-4 font-display text-2xl font-semibold text-ink">Invite {name} to a job</h1>
        <p className="mt-1 text-sm text-ink/60">Pick from your open jobs, or send a new private job only they can see.</p>
      </div>

      {inviteableJobs.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/60">Pick from your open jobs</h2>
          <SavingForm
            action={inviteCreative}
            successText="Invite sent."
            className="space-y-4 rounded-lg border border-ink/15 bg-white p-5"
          >
            <input type="hidden" name="creative_id" value={id} />
            <div className="space-y-1.5">
              <Label htmlFor="job_id">Job</Label>
              <select id="job_id" name="job_id" required className="w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-sm">
                {inviteableJobs.map((j) => (
                  <option key={j.id} value={j.id} disabled={j.alreadyInvited}>
                    {j.title}{j.alreadyInvited ? " (already invited)" : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="message">Message (optional)</Label>
              <Textarea id="message" name="message" rows={3} placeholder="Why you'd like them on this job." />
            </div>
            <SubmitButton pendingText="Sending…">Send invite</SubmitButton>
          </SavingForm>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/60">
          {inviteableJobs.length > 0 ? "Or send a new private job" : "Send a new private job"}
        </h2>
        <p className="text-xs text-ink/55">
          Won't appear on the public jobs board. Only {name} can see and accept it.
        </p>
        <SavingForm
          action={sendInviteWithNewJob}
          successText="Private job sent."
          className="space-y-4 rounded-lg border border-ink/15 bg-white p-5"
        >
          <input type="hidden" name="creative_id" value={id} />
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" required placeholder="e.g. Logo refresh for a small café" />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="category">Category</Label>
              <select id="category" name="category" required className="w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-sm">
                <option value="">Pick one</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="budget_mwk">Budget (MWK)</Label>
              <Input id="budget_mwk" name="budget_mwk" type="number" min={1} step={1} required />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="deadline">Deadline (optional)</Label>
            <Input id="deadline" name="deadline" type="date" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="brief">Brief</Label>
            <CharCountTextarea id="brief" name="brief" rows={6} required minLength={200} placeholder="What's the job, why it matters, who it's for, any constraints." />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="deliverables">Deliverables</Label>
            <CharCountTextarea id="deliverables" name="deliverables" rows={3} required minLength={50} placeholder="Exactly what you'll receive at the end." />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="message">Message to {name} (optional)</Label>
            <Textarea id="message" name="message" rows={2} placeholder="Anything you want to say alongside the invite." />
          </div>
          <SubmitButton pendingText="Sending…">Send private job</SubmitButton>
        </SavingForm>
      </section>
    </div>
  );
}
