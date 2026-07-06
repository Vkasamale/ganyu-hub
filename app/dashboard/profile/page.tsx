import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateProfile, updateAvailability } from "@/app/actions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SavingForm, SubmitButton } from "@/components/saving-form";
import { ImagePicker } from "@/components/image-picker";

export default async function EditProfilePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  const showAvailability = profile?.role === "creative" || profile?.role === "agency";
  const currentAvailability = (profile?.availability as string | undefined) || "available";

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 space-y-6">
      {showAvailability && (
        <Card>
          <CardHeader><CardTitle>Availability</CardTitle></CardHeader>
          <CardContent>
            <SavingForm action={updateAvailability} successText="Availability updated." className="flex items-center gap-3">
              <Label htmlFor="availability" className="sr-only">Availability</Label>
              <select
                id="availability"
                name="availability"
                defaultValue={currentAvailability}
                className="h-10 rounded-lg border border-ink/20 bg-paper px-3 text-sm text-ink focus:border-ink/40 focus:outline-none"
              >
                <option value="available">🟢 Available for work</option>
                <option value="busy">🟡 Busy — limited slots</option>
                <option value="unavailable">⚪ Not taking work</option>
              </select>
              <SubmitButton pendingText="Saving…">Update</SubmitButton>
            </SavingForm>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Edit your profile</CardTitle></CardHeader>
        <CardContent>
          <SavingForm action={updateProfile} successText="Profile saved." className="space-y-4">
            <div className="space-y-1.5">
              <Label>Profile photo</Label>
              <ImagePicker name="avatar_file" currentUrl={profile?.avatar_url} shape="circle" label="Upload photo" />
            </div>
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
