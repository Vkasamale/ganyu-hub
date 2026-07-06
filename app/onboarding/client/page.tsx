import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { completeClientOnboarding } from "@/app/actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SavingForm, SubmitButton } from "@/components/saving-form";
import { CategoryPicker } from "@/components/category-picker";

export default async function ClientOnboardingPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (profile?.onboarded_at) redirect("/dashboard");

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-10">
      <div>
        <h1 className="text-3xl font-bold">Welcome to Ganyu Hub</h1>
        <p className="mt-2 text-neutral-600">A couple of quick questions so creatives know who they&apos;re working with, then you&apos;re in.</p>
      </div>

      <SavingForm action={completeClientOnboarding} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>1. Who are you?</CardTitle>
            <p className="text-sm text-neutral-500">Your name or your company name.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="full_name">Name or company</Label>
              <Input id="full_name" name="full_name" required defaultValue={profile?.full_name || ""} placeholder="e.g. Acme Coffee" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="headline">One-line description (optional)</Label>
              <Input id="headline" name="headline" defaultValue={profile?.headline || ""} placeholder="e.g. Speciality coffee roaster in Lilongwe" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bio">About (optional)</Label>
              <Textarea id="bio" name="bio" rows={3} defaultValue={profile?.bio || ""} placeholder="What you do and the kind of work you typically commission." />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. What do you typically hire for?</CardTitle>
            <p className="text-sm text-neutral-500">We&apos;ll use this to recommend creatives in &ldquo;For you&rdquo;.</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              <Label>Categories</Label>
              <CategoryPicker selected={profile?.categories || []} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Post your first job?</CardTitle>
            <p className="text-sm text-neutral-500">Optional. We can drop you on the job-posting form right after this.</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name="post_now" value="yes" />
              <span>Yes, take me to post a job now</span>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name="post_now" value="no" defaultChecked />
              <span>Not yet, I&apos;ll browse first</span>
            </label>
          </CardContent>
        </Card>

        <SubmitButton pendingText="Finishing up…">Finish</SubmitButton>
      </SavingForm>
    </div>
  );
}
