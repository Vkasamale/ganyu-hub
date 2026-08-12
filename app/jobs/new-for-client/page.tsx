import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/supabase/user";
import { createJobForClient } from "@/app/actions";
import { Input } from "@/components/ui/input";
import { MoneyInput } from "@/components/money-input";
import { PricingExplainer } from "@/components/pricing-explainer";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SavingForm, SubmitButton } from "@/components/saving-form";
import { CharCountTextarea } from "@/components/char-count-textarea";
import { CATEGORIES } from "@/lib/types";

export default async function NewJobForClientPage() {
  const supabase = createClient();
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const { data: me } = await supabase.from("profiles").select("role, onboarded_at").eq("id", user.id).single();
  if (me?.role !== "creative") redirect("/dashboard");
  if (!me?.onboarded_at) redirect("/dashboard/profile?complete=1");

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Create a job for a client</CardTitle>
          <p className="mt-2 text-sm text-ink/70">
            Use this when you&rsquo;ve already agreed terms and price with a client off-platform.
            You&rsquo;ll get a private link to send them &mdash; they open it, sign up in seconds, and fund escrow.
          </p>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <PricingExplainer audience="creative" />
          </div>
          <SavingForm action={createJobForClient} successText="Job created." className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" required placeholder="e.g. Logo for Kanjedza Coffee" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="category">Category</Label>
              <select id="category" name="category" required className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="brief">Brief</Label>
              <CharCountTextarea id="brief" name="brief" required rows={7} minLength={200}
                placeholder="What the client wants, tone, references, anything you need before starting. The client will read this on the landing page &mdash; the more specific, the fewer disputes." />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="deliverables">Deliverables</Label>
              <CharCountTextarea id="deliverables" name="deliverables" required rows={4} minLength={50}
                placeholder="What the client will receive. e.g.&#10;- Final logo (PNG + SVG)&#10;- 3 color variants&#10;- Source file" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="agreed_price_mwk">Agreed price (MWK)</Label>
                <MoneyInput id="agreed_price_mwk" name="agreed_price_mwk" required placeholder="e.g. 150,000" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="deadline">Deadline</Label>
                <Input id="deadline" name="deadline" type="date" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="revisions_included">Revisions included</Label>
                <Input id="revisions_included" name="revisions_included" type="number" min={0} max={10} defaultValue={2} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="extra_revision_rate">Extra revision rate (MWK)</Label>
                <MoneyInput id="extra_revision_rate" name="extra_revision_rate" placeholder="Leave blank if none" />
              </div>
            </div>
            <SubmitButton pendingText="Creating…">Create job &amp; get client link</SubmitButton>
            <p className="text-xs text-ink/55">
              The job is private &mdash; it will not appear on the public jobs board.
            </p>
          </SavingForm>
        </CardContent>
      </Card>
    </div>
  );
}
