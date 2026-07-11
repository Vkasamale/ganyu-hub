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
              : "Where PayChangu sends your money when a client releases payment. Add multiple; the default is used unless a specific job overrides it."}
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
            <SavingForm action={addPayoutMethod} successText="Payment method added." resetOnSuccess className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="kind">Type</Label>
                <select id="kind" name="kind" defaultValue="mobile" className="h-10 w-full rounded-lg border border-ink/20 bg-paper px-3 text-sm text-ink focus:border-ink/40 focus:outline-none">
                  <option value="mobile">Mobile money (Airtel / TNM)</option>
                  <option value="bank">Bank account</option>
                </select>
                <p className="text-xs text-ink/50">Pick the type, then fill in whichever section matches.</p>
              </div>

              <div className="space-y-3 rounded-md border border-ink/10 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-ink/50">Mobile money (fill if type = Mobile)</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_160px]">
                  <div className="space-y-1.5">
                    <Label htmlFor="mobile_number">Number</Label>
                    <Input id="mobile_number" name="mobile_number" placeholder="e.g. 099XXXXXXX" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="mobile_network">Network</Label>
                    <select id="mobile_network" name="mobile_network" defaultValue="" className="h-10 w-full rounded-lg border border-ink/20 bg-paper px-3 text-sm text-ink focus:border-ink/40 focus:outline-none">
                      <option value="">Select…</option>
                      <option value="airtel">Airtel Money</option>
                      <option value="tnm">TNM Mpamba</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-3 rounded-md border border-ink/10 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-ink/50">Bank account (fill if type = Bank)</p>
                <div className="space-y-1.5">
                  <Label htmlFor="bank_uuid">Bank</Label>
                  <select id="bank_uuid" name="bank_uuid" defaultValue="" className="h-10 w-full rounded-lg border border-ink/20 bg-paper px-3 text-sm text-ink focus:border-ink/40 focus:outline-none">
                    <option value="">Select bank…</option>
                    {banks.map((b) => (
                      <option key={b.uuid} value={b.uuid}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bank_account_name">Account name</Label>
                  <Input id="bank_account_name" name="bank_account_name" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bank_account_number">Account number</Label>
                  <Input id="bank_account_number" name="bank_account_number" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="label">Nickname (optional)</Label>
                <Input id="label" name="label" placeholder="e.g. Personal, Business" />
              </div>

              <SubmitButton pendingText="Adding…">Add payment method</SubmitButton>
            </SavingForm>
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
            <SubmitButton>Save</SubmitButton>
          </SavingForm>
        </CardContent>
      </Card>
    </div>
  );
}
