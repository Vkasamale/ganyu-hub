import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/supabase/user";
import { completeCreativeOnboarding } from "@/app/actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SavingForm, SubmitButton } from "@/components/saving-form";
import { CategoryPicker } from "@/components/category-picker";
import { ImagePicker } from "@/components/image-picker";
import { TagInput } from "@/components/tag-input";
import { MoneyInput } from "@/components/money-input";

export default async function CreativeOnboardingPage() {
  const supabase = createClient();
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (profile?.onboarded_at) redirect("/dashboard");

  // Prefill from the Google identity (name + email; Google doesn't expose phone).
  const meta = (user.user_metadata || {}) as Record<string, string | undefined>;
  const nameDefault = profile?.full_name || meta.full_name || meta.name || "";
  const phoneDefault = profile?.phone || meta.phone || "";
  const email = user.email || meta.email || "";

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-10">
      <div>
        <h1 className="text-3xl font-bold">Welcome to Ganyu Hub</h1>
        <p className="mt-2 text-ink/65">Three quick steps and your profile is live. Clients can&apos;t find a blank profile, so let&apos;s fix that.</p>
      </div>

      <SavingForm action={completeCreativeOnboarding} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>1. Tell clients who you are</CardTitle>
            <p className="text-sm text-ink/55">A one-line headline and a short bio.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="full_name">Your name</Label>
              <Input id="full_name" name="full_name" required placeholder="e.g. Thoko Banda" defaultValue={nameDefault} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} readOnly disabled className="bg-raised text-ink/55" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone / WhatsApp</Label>
                <Input id="phone" name="phone" type="tel" required placeholder="e.g. +265 99 123 4567" defaultValue={phoneDefault} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="headline">Headline</Label>
              <Input id="headline" name="headline" required placeholder="e.g. Brand designer based in Blantyre" defaultValue={profile?.headline || ""} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bio">Short bio</Label>
              <Textarea id="bio" name="bio" rows={4} required placeholder="Who you are, what you make, who you've worked with." defaultValue={profile?.bio || ""} />
            </div>
            <div className="space-y-1.5">
              <Label>Categories</Label>
              <CategoryPicker selected={profile?.categories || []} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="skills">Skills</Label>
              <TagInput name="skills" defaultValue={profile?.skills || []} placeholder="e.g. Afrobeats, Live mixing, Branding — Enter after each" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Add one example of your work</CardTitle>
            <p className="text-sm text-ink/55">A project, a gig, an event, a set — whatever shows what you do. Even one beats a blank profile. Add more later.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="piece_title">Title</Label>
              <Input id="piece_title" name="piece_title" required placeholder="e.g. New Year's set at Club X · Coffee brand identity · Wedding highlight reel" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="piece_description">Description</Label>
              <Textarea id="piece_description" name="piece_description" rows={3} placeholder="What it was, who it was for, how it went." />
            </div>
            <div className="space-y-1.5">
              <Label>Cover image</Label>
              <ImagePicker name="piece_cover_file" shape="wide" label="Upload cover" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="piece_project_url">Link (optional)</Label>
              <Input id="piece_project_url" name="piece_project_url" type="url" placeholder="Mixcloud, YouTube, Instagram, a portfolio page…" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Add your first service</CardTitle>
            <p className="text-sm text-ink/55">A specific service you offer, with a starting price. You can add more on your rate card later.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="service_title">Service title</Label>
              <Input id="service_title" name="service_title" required placeholder="e.g. DJ set, Logo design, Wedding video edit, A2 poster" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="service_price_mwk">From (MWK)</Label>
                <MoneyInput id="service_price_mwk" name="service_price_mwk" required placeholder="50,000" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="service_price_mwk_max">Up to (MWK, optional)</Label>
                <MoneyInput id="service_price_mwk_max" name="service_price_mwk_max" placeholder="150,000" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="service_delivery_days">Typical delivery time (days, optional)</Label>
              <Input id="service_delivery_days" name="service_delivery_days" type="number" min={1} placeholder="Leave blank if it varies (e.g. a live gig)" />
            </div>
          </CardContent>
        </Card>

        <SubmitButton pendingText="Finishing up…">Finish & go to dashboard</SubmitButton>
      </SavingForm>
    </div>
  );
}
