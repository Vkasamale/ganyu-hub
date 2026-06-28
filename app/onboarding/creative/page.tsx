import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { completeCreativeOnboarding } from "@/app/actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SavingForm, SubmitButton } from "@/components/saving-form";

export default async function CreativeOnboardingPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (profile?.onboarded_at) redirect("/dashboard");

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-10">
      <div>
        <h1 className="text-3xl font-bold">Welcome to Ganyu Hub</h1>
        <p className="mt-2 text-neutral-600">Three quick steps and your profile is live. Clients can&apos;t find a blank profile, so let&apos;s fix that.</p>
      </div>

      <SavingForm action={completeCreativeOnboarding} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>1. Tell clients who you are</CardTitle>
            <p className="text-sm text-neutral-500">A one-line headline and a short bio.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="headline">Headline</Label>
              <Input id="headline" name="headline" required placeholder="e.g. Brand designer based in Blantyre" defaultValue={profile?.headline || ""} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bio">Short bio</Label>
              <Textarea id="bio" name="bio" rows={4} required placeholder="Who you are, what you make, who you've worked with." defaultValue={profile?.bio || ""} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="categories">Categories (comma-separated)</Label>
              <Input id="categories" name="categories" placeholder="Design, Content Creation" defaultValue={(profile?.categories || []).join(", ")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="skills">Skills (comma-separated)</Label>
              <Input id="skills" name="skills" placeholder="Figma, Branding, Illustration" defaultValue={(profile?.skills || []).join(", ")} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Add one piece of work</CardTitle>
            <p className="text-sm text-neutral-500">Even one piece beats a blank portfolio. Add more later.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="piece_title">Project title</Label>
              <Input id="piece_title" name="piece_title" required placeholder="e.g. Coffee brand identity" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="piece_description">Description</Label>
              <Textarea id="piece_description" name="piece_description" rows={3} placeholder="What you delivered, the client, the result." />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="piece_cover_url">Cover image URL</Label>
              <Input id="piece_cover_url" name="piece_cover_url" type="url" placeholder="https://..." />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="piece_project_url">Project URL</Label>
              <Input id="piece_project_url" name="piece_project_url" type="url" placeholder="https://..." />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Add your first service</CardTitle>
            <p className="text-sm text-neutral-500">A specific service you offer, with a starting price. You can add more on your rate card later.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="service_title">Service title</Label>
              <Input id="service_title" name="service_title" required placeholder="e.g. Logo design, Wedding video edit, A2 poster" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="service_price_mwk">From (MWK)</Label>
                <Input id="service_price_mwk" name="service_price_mwk" type="number" min={0} required placeholder="50000" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="service_price_mwk_max">Up to (MWK, optional)</Label>
                <Input id="service_price_mwk_max" name="service_price_mwk_max" type="number" min={0} placeholder="150000" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="service_delivery_days">Typical delivery (days)</Label>
              <Input id="service_delivery_days" name="service_delivery_days" type="number" min={1} defaultValue={7} />
            </div>
          </CardContent>
        </Card>

        <SubmitButton pendingText="Finishing up…">Finish & go to dashboard</SubmitButton>
      </SavingForm>
    </div>
  );
}
