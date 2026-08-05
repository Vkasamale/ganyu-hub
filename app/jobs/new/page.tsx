import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { postJob } from "@/app/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SavingForm, SubmitButton } from "@/components/saving-form";
import { CharCountTextarea } from "@/components/char-count-textarea";
import { PricingExplainer } from "@/components/pricing-explainer";
import { MoneyInput } from "@/components/money-input";
import { CATEGORIES } from "@/lib/types";

export default async function NewJobPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Card>
        <CardHeader><CardTitle>Post a job</CardTitle></CardHeader>
        <CardContent>
          <div className="mb-4">
            <PricingExplainer audience="client" />
          </div>
          <SavingForm action={postJob} successText="Job posted." className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" required placeholder="e.g. Logo for new coffee brand" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="category">Category</Label>
              <select id="category" name="category" required className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="brief">Brief</Label>
              <CharCountTextarea id="brief" name="brief" required rows={7} minLength={200} placeholder="Describe what you need, the audience, tone, references, and anything the creative needs to know before starting. Accepting a proposal is a contract. The more specific here, the fewer disputes later." />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="deliverables">Deliverables</Label>
              <CharCountTextarea id="deliverables" name="deliverables" required rows={4} minLength={50} placeholder="What exactly will you receive? e.g.&#10;- Final logo in PNG and SVG&#10;- 3 color variants&#10;- Source file (.ai or .fig)" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="deadline">Deadline</Label>
                <Input id="deadline" name="deadline" type="date" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="revisions_included">Revisions included</Label>
                <Input id="revisions_included" name="revisions_included" type="number" min={0} max={10} defaultValue={2} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="format_spec">Format / spec (optional)</Label>
              <Input id="format_spec" name="format_spec" placeholder="e.g. 1080×1920 MP4, under 60s" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="budget_mwk">Budget (MWK)</Label>
              <MoneyInput id="budget_mwk" name="budget_mwk" placeholder="e.g. 150,000" />
            </div>
            <SubmitButton pendingText="Posting…">Post job</SubmitButton>
            <p className="text-xs text-ink/55">
              By posting, you agree to our <a href="/content-policy" className="underline hover:text-ink">content policy</a>.
            </p>
          </SavingForm>
        </CardContent>
      </Card>
    </div>
  );
}
