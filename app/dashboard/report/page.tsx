import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/supabase/user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SavingForm, SubmitButton } from "@/components/saving-form";
import { submitUserReport } from "@/app/actions";

export default async function ReportPage({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const supabase = createClient();
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const sp = await searchParams;
  const prefillRef = sp?.ref || "";

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Report an issue</CardTitle>
          <p className="text-sm text-ink/55">
            Saw an error message? Paste the reference (e.g. ERR-00042) and describe what happened. An admin will follow up.
          </p>
        </CardHeader>
        <CardContent>
          <SavingForm action={submitUserReport} successText="Report submitted." className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="reference">Reference (optional)</Label>
              <Input id="reference" name="reference" defaultValue={prefillRef} placeholder="ERR-00042" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="body">What happened?</Label>
              <Textarea id="body" name="body" required minLength={20} rows={6} placeholder="Describe what you were doing and what went wrong." />
            </div>
            <SubmitButton pendingText="Sending…">Submit report</SubmitButton>
          </SavingForm>
        </CardContent>
      </Card>
    </div>
  );
}
