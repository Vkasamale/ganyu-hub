import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateProfile, updateAvailability, addPayoutMethod, setDefaultPayoutMethod, deletePayoutMethod } from "@/app/actions";
import { getSupportedBanks } from "@/lib/payments";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SavingForm, SubmitButton } from "@/components/saving-form";
import { ImagePicker } from "@/components/image-picker";
import { CategoryPicker } from "@/components/category-picker";
import { AddPayoutMethodForm } from "@/components/add-payout-method-form";

function maskTail(s: string | null | undefined, keep = 4) {
  if (!s) return "";
  if (s.length <= keep) return s;
  return "•".repeat(Math.max(0, s.length - keep)) + s.slice(-keep);
}

export default async function EditProfilePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  const showAvailability = profile?.role === "creative" || profile?.role === "agency";
  const currentAvailability = (profile?.availability as string | undefined) || "available";
  const banks = await getSupportedBanks("MWK");
  const isClient = profile?.role === "client";
  const { data: methods } = await supabase.from("payout_methods")
    .select("id, kind, mobile_number, mobile_network, bank_uuid, bank_account_name, bank_account_number, label, is_default, created_at")
    .eq("user_id", user.id).order("is_default", { ascending: false }).order("created_at", { ascending: true });
  const bankName = (uuid: string | null | undefined) => banks.find((b) => b.uuid === uuid)?.name || "Bank";

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
          <CardTitle>Payment methods</CardTitle>
          <p className="text-sm text-ink/60">
            {isClient
              ? "Saved so you don't have to re-type them at checkout. You can add multiple and pick a default."
              : "Where your money is sent when a client releases payment. Add multiple; the default is used unless a specific job overrides it."}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {methods && methods.length > 0 ? (
            <ul className="space-y-2">
              {methods.map((m) => (
                <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-ink/10 bg-paper/40 p-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-paper border border-ink/20 text-ink">
                        {m.kind === "mobile" ? (m.mobile_network === "airtel" ? "Airtel Money" : "TNM Mpamba") : bankName(m.bank_uuid)}
                      </Badge>
                      {m.is_default && <Badge className="bg-ink text-paper">Default</Badge>}
                      {m.label && <span className="text-xs text-ink/60">{m.label}</span>}
                    </div>
                    <p className="mt-1 truncate text-sm text-ink/70">
                      {m.kind === "mobile" ? maskTail(m.mobile_number, 4) : `${m.bank_account_name} · ${maskTail(m.bank_account_number, 4)}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!m.is_default && (
                      <SavingForm action={setDefaultPayoutMethod} successText="Default updated." silent>
                        <input type="hidden" name="id" value={m.id} />
                        <SubmitButton size="sm" variant="outline" pendingText="…">Set as default</SubmitButton>
                      </SavingForm>
                    )}
                    <SavingForm action={deletePayoutMethod} successText="Removed." silent>
                      <input type="hidden" name="id" value={m.id} />
                      <SubmitButton size="sm" variant="outline" pendingText="…">Delete</SubmitButton>
                    </SavingForm>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink/60">No payment methods saved yet. Add one below.</p>
          )}

          <div className="rounded-lg border border-ink/10 bg-paper/40 p-4">
            <p className="mb-3 text-sm font-medium text-ink/80">Add a payment method</p>
            <AddPayoutMethodForm banks={banks} />
          </div>
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
            {/* Phase 1 items 10-13. The marker tells updateProfile that this
                form owns these fields, so an unchecked box means "off" here
                and means nothing at all in the forms that omit them. */}
            <input type="hidden" name="profile_prefs" value="1" />

            <div className="space-y-1.5">
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                name="tagline"
                maxLength={80}
                defaultValue={profile?.tagline || ""}
                placeholder="Six words on what you do best"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="languages">Languages (comma-separated)</Label>
              <Input
                id="languages"
                name="languages"
                defaultValue={(profile?.languages || []).join(", ")}
                placeholder="Chichewa, English, Tumbuka, Yao"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="hours_per_week">Hours a week you can take on</Label>
              <Input
                id="hours_per_week"
                name="hours_per_week"
                type="number"
                min={1}
                max={168}
                inputMode="numeric"
                placeholder="e.g. 20"
                defaultValue={profile?.hours_per_week ?? undefined}
              />
            </div>

            <fieldset className="space-y-2 rounded-lg border border-ink/10 bg-wash/30 p-4">
              <legend className="px-1 text-xs font-semibold uppercase tracking-[0.12em] text-ink/55">
                What clients see
              </legend>
              <label className="flex items-start gap-2.5 text-sm text-ink">
                <input
                  type="checkbox"
                  name="open_to_work"
                  defaultChecked={profile?.open_to_work ?? true}
                  className="mt-0.5 h-4 w-4 rounded border-ink/30"
                />
                <span>
                  Open to work
                  <span className="block text-xs text-ink/55">Untick while you are full. Your profile stays up.</span>
                </span>
              </label>
              <label className="flex items-start gap-2.5 text-sm text-ink">
                <input
                  type="checkbox"
                  name="open_for_messages"
                  defaultChecked={profile?.open_for_messages ?? true}
                  className="mt-0.5 h-4 w-4 rounded border-ink/30"
                />
                <span>
                  Open for messages
                  <span className="block text-xs text-ink/55">
                    You set this yourself — we never guess it from when you were last online.
                  </span>
                </span>
              </label>
            </fieldset>

            <SubmitButton>Save</SubmitButton>
          </SavingForm>
        </CardContent>
      </Card>
    </div>
  );
}
