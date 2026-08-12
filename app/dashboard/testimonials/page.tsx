import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/supabase/user";
import { createTestimonialRequest, setTestimonialStatus, deleteTestimonial } from "@/app/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SavingForm, SubmitButton } from "@/components/saving-form";
import { EmptyState } from "@/components/empty-state";
import { ClientLinkCopy } from "@/components/client-link-copy";
import { timeAgo } from "@/lib/utils";

/**
 * Items 26-27, the creative's side. Create a link, send it to a past client,
 * then decide whether what comes back goes on the profile.
 *
 * The creative can publish or hide, and cannot edit — that limit is enforced
 * in the database by column-level grants (see supabase/schema.sql), not merely
 * by this page declining to offer an edit box.
 */
export default async function TestimonialsPage() {
  const supabase = createClient();
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const { data: rows } = await supabase
    .from("testimonials")
    .select("id, client_name, relationship, body, token, status, request_note, submitted_at, created_at")
    .eq("creative_id", user.id)
    .order("created_at", { ascending: false });

  const all = rows || [];
  const pending = all.filter((t: any) => t.status === "pending");
  const waiting = all.filter((t: any) => t.status === "submitted");
  const live = all.filter((t: any) => t.status === "published");
  const hidden = all.filter((t: any) => t.status === "hidden");

  return (
    <div className="space-y-8">
      <header>
        <p className="eyebrow">Proof</p>
        <h1 className="mt-1 text-3xl font-semibold text-ink">Testimonials</h1>
        <p className="mt-1 max-w-2xl text-sm text-ink/60">
          Worked with someone before Ganyu Hub existed? Send them a link and let them vouch for you.
          It appears on your profile marked as work done off the platform — honest about what it is,
          and worth more than anything you could write about yourself.
        </p>
      </header>

      <Card>
        <CardHeader><CardTitle>Request a testimonial</CardTitle></CardHeader>
        <CardContent>
          <SavingForm action={createTestimonialRequest} successText="Link created — copy it below." resetOnSuccess className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="request_note">Who is this for? (optional)</Label>
              <Input id="request_note" name="request_note" maxLength={120} placeholder="Grace at the bakery" />
              <p className="text-xs text-ink/55">
                Only you see this. It is here so you can tell your unused links apart.
              </p>
            </div>
            <SubmitButton pendingText="Creating…">Create link</SubmitButton>
          </SavingForm>
        </CardContent>
      </Card>

      {waiting.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-ink">Waiting for you ({waiting.length})</h2>
          <p className="mt-1 text-sm text-ink/60">
            Publish what you are happy to show. You cannot edit what they wrote — that is the point
            of it.
          </p>
          <div className="mt-4 space-y-3">
            {waiting.map((t: any) => (
              <TestimonialCard key={t.id} t={t} actions={["publish", "delete"]} />
            ))}
          </div>
        </section>
      )}

      {pending.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-ink">Links you have not used yet ({pending.length})</h2>
          <div className="mt-4 space-y-3">
            {pending.map((t: any) => (
              <div key={t.id} className="card-soft p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-ink">{t.request_note || "Untitled request"}</p>
                  <span className="text-xs text-ink/50">created {timeAgo(t.created_at)}</span>
                </div>
                <div className="mt-3">
                  <ClientLinkCopy token={t.token} path="t" />
                </div>
                <SavingForm action={deleteTestimonial} silent className="mt-3">
                  <input type="hidden" name="id" value={t.id} />
                  <Button size="sm" variant="outline" type="submit">Delete link</Button>
                </SavingForm>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-xl font-semibold text-ink">On your profile ({live.length})</h2>
        <div className="mt-4 space-y-3">
          {live.map((t: any) => (
            <TestimonialCard key={t.id} t={t} actions={["hide"]} />
          ))}
          {live.length === 0 && (
            <EmptyState
              tone="quiet"
              title="Nothing published yet"
              body="Testimonials you publish appear on your public profile, under their own heading."
            />
          )}
        </div>
      </section>

      {hidden.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-ink">Hidden ({hidden.length})</h2>
          <div className="mt-4 space-y-3">
            {hidden.map((t: any) => (
              <TestimonialCard key={t.id} t={t} actions={["publish", "delete"]} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function TestimonialCard({ t, actions }: { t: any; actions: ("publish" | "hide" | "delete")[] }) {
  return (
    <div className="card-soft p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-semibold text-ink">{t.client_name}</p>
        <span className="text-xs text-ink/50">{t.submitted_at ? timeAgo(t.submitted_at) : ""}</span>
      </div>
      {t.relationship && <p className="text-xs text-ink/60">{t.relationship}</p>}
      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink/80">{t.body}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {actions.includes("publish") && (
          <SavingForm action={setTestimonialStatus} successText="Published to your profile.">
            <input type="hidden" name="id" value={t.id} />
            <input type="hidden" name="status" value="published" />
            <SubmitButton size="sm" pendingText="Publishing…">Publish</SubmitButton>
          </SavingForm>
        )}
        {actions.includes("hide") && (
          <SavingForm action={setTestimonialStatus} successText="Hidden from your profile.">
            <input type="hidden" name="id" value={t.id} />
            <input type="hidden" name="status" value="hidden" />
            <SubmitButton size="sm" variant="outline" pendingText="Hiding…">Hide</SubmitButton>
          </SavingForm>
        )}
        {actions.includes("delete") && (
          <SavingForm action={deleteTestimonial} silent>
            <input type="hidden" name="id" value={t.id} />
            <Button size="sm" variant="outline" type="submit">Delete</Button>
          </SavingForm>
        )}
      </div>
    </div>
  );
}
