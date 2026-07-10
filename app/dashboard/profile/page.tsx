import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateProfile, updateAvailability, savePayoutDetails } from "@/app/actions";
import { getSupportedBanks } from "@/lib/payments";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SavingForm, SubmitButton } from "@/components/saving-form";
import { ImagePicker } from "@/components/image-picker";
import { CategoryPicker } from "@/components/category-picker";

export default async function EditProfilePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  const showAvailability = profile?.role === "creative" || profile?.role === "agency";
  const currentAvailability = (profile?.availability as string | undefined) || "available";
  const banks = await getSupportedBanks("MWK");
  const isClient = profile?.role === "client";

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
          <CardHeader>
            <CardTitle>Payment details</CardTitle>
            <p className="text-sm text-ink/60">
              {isClient
                ? "Saved so you don't have to re-type them when you pay into escrow. You can still change them at checkout."
                : "Where PayChangu sends your money when a client releases payment. Mobile money is fastest; bank is optional."}
            </p>
          </CardHeader>
          <CardContent>
            <SavingForm action={savePayoutDetails} successText="Payout details saved." className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_160px]">
                <div className="space-y-1.5">
                  <Label htmlFor="payout_mobile_number">Mobile money number</Label>
                  <Input id="payout_mobile_number" name="payout_mobile_number" defaultValue={profile?.payout_mobile_number || ""} placeholder="e.g. 099XXXXXXX" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="payout_mobile_network">Network</Label>
                  <select
                    id="payout_mobile_network"
                    name="payout_mobile_network"
                    defaultValue={profile?.payout_mobile_network || ""}
                    className="h-10 w-full rounded-lg border border-ink/20 bg-paper px-3 text-sm text-ink focus:border-ink/40 focus:outline-none"
                  >
                    <option value="">Select…</option>
                    <option value="airtel">Airtel Money</option>
                    <option value="tnm">TNM Mpamba</option>
                  </select>
                </div>
              </div>
              <details className="rounded-lg border border-ink/10 bg-paper/40 p-3">
                <summary className="cursor-pointer text-sm font-medium text-ink/80">Bank account (optional)</summary>
                <div className="mt-3 space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="payout_bank_uuid">Bank</Label>
                    <select
                      id="payout_bank_uuid"
                      name="payout_bank_uuid"
                      defaultValue={profile?.payout_bank_uuid || ""}
                      className="h-10 w-full rounded-lg border border-ink/20 bg-paper px-3 text-sm text-ink focus:border-ink/40 focus:outline-none"
                    >
                      <option value="">Select bank…</option>
                      {banks.map((b) => (
                        <option key={b.uuid} value={b.uuid}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="payout_bank_account_name">Account name</Label>
                    <Input id="payout_bank_account_name" name="payout_bank_account_name" defaultValue={profile?.payout_bank_account_name || ""} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="payout_bank_account_number">Account number</Label>
                    <Input id="payout_bank_account_number" name="payout_bank_account_number" defaultValue={profile?.payout_bank_account_number || ""} />
                  </div>
                  <p className="text-xs text-ink/50">Bank payouts may need PayChangu support to activate on your account. Mobile money works out of the box.</p>
                </div>
              </details>
              <SubmitButton pendingText="Saving…">Save payment details</SubmitButton>
            </SavingForm>
          </CardContent>
        </Card>

      <Card>
        <CardHeader><CardTitle>Edit your profile</CardTitle></CardHeader>
        <CardContent>
          <SavingForm action={updateProfile} successText="Profile saved." className="space-y-4">
            <div className="space-y-1.5">
              <Label>Profile photo</Label>
              <ImagePicker name="avatar_file" currentUrl={profile?.avatar_url} shape="circle" label="Upload photo" />
            </div>
            <div className="space-y-1.5">
              <Label>Cover photo</Label>
              <ImagePicker name="cover_file" currentUrl={profile?.cover_url} shape="wide" label="Upload cover" />
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
              <Label>Categories</Label>
              <CategoryPicker selected={profile?.categories || []} />
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
