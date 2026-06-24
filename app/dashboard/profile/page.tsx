import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateProfile } from "@/app/actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SavingForm, SubmitButton } from "@/components/saving-form";

export default async function EditProfilePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Card>
        <CardHeader><CardTitle>Edit your profile</CardTitle></CardHeader>
        <CardContent>
          <SavingForm action={updateProfile} successText="Profile saved." className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="full_name">Full name</Label>
              <Input id="full_name" name="full_name" defaultValue={profile?.full_name || ""} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="headline">Headline</Label>
              <Input id="headline" name="headline" defaultValue={profile?.headline || ""} placeholder="e.g. Brand designer based in Blantyre" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" name="bio" rows={5} defaultValue={profile?.bio || ""} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" defaultValue={profile?.location || "Malawi"} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="hourly_rate_mwk">Hourly rate (MWK)</Label>
              <Input id="hourly_rate_mwk" name="hourly_rate_mwk" type="number" min={0} defaultValue={profile?.hourly_rate_mwk || ""} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="categories">Categories (comma-separated)</Label>
              <Input id="categories" name="categories" defaultValue={(profile?.categories || []).join(", ")} placeholder="Design, Development" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="skills">Skills (comma-separated)</Label>
              <Input id="skills" name="skills" defaultValue={(profile?.skills || []).join(", ")} placeholder="Figma, Branding, React" />
            </div>
            <SubmitButton>Save</SubmitButton>
          </SavingForm>
        </CardContent>
      </Card>
    </div>
  );
}
