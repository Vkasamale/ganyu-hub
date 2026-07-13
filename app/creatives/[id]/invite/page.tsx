import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SavingForm, SubmitButton } from "@/components/saving-form";
import { inviteCreative } from "@/app/actions";

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

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <Link href={`/creatives/${id}`} className="text-sm text-ink/60 hover:text-ink">← Back to profile</Link>
      <h1 className="mt-4 font-display text-2xl font-semibold text-ink">
        Invite {profile.full_name || "creative"} to a job
      </h1>

      {inviteableJobs.length === 0 ? (
        <div className="mt-6 rounded-md border border-ink/15 bg-white p-4 text-sm text-ink/70">
          You have no open jobs to invite them to.{" "}
          <Link href="/jobs/new" className="text-stamp underline">Post a job</Link>.
        </div>
      ) : (
        <SavingForm
          action={inviteCreative}
          successText="Invite sent."
          className="mt-6 space-y-4 rounded-lg border border-ink/15 bg-white p-5"
        >
          <input type="hidden" name="creative_id" value={id} />
          <div className="space-y-1.5">
            <Label htmlFor="job_id">Job</Label>
            <select
              id="job_id"
              name="job_id"
              required
              className="w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-sm"
            >
              {inviteableJobs.map((j) => (
                <option key={j.id} value={j.id} disabled={j.alreadyInvited}>
                  {j.title}{j.alreadyInvited ? " (already invited)" : ""}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="message">Message (optional)</Label>
            <Textarea id="message" name="message" rows={4} placeholder="Why you'd like them on this job." />
          </div>
          <SubmitButton pendingText="Sending…">Send invite</SubmitButton>
        </SavingForm>
      )}
    </div>
  );
}
