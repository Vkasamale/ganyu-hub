import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/supabase/user";
import { updateAccount, updatePassword } from "@/app/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SavingForm, SubmitButton } from "@/components/saving-form";
import { RegisterPasskey } from "@/components/passkey";

export default async function AccountPage() {
  const supabase = createClient();
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <p className="text-sm text-neutral-500">Your name, email, and contact number. Used for sign-in and notifications.</p>
        </CardHeader>
        <CardContent>
          <SavingForm action={updateAccount} successText="Account saved." className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="full_name">Full name</Label>
              <Input id="full_name" name="full_name" defaultValue={profile?.full_name || ""} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={user.email || ""} required />
              <p className="text-xs text-neutral-500">Changing your email sends a confirmation link to the new address.</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone number</Label>
              <Input id="phone" name="phone" type="tel" defaultValue={profile?.phone || ""} placeholder="+265 ..." />
            </div>
            <SubmitButton>Save account</SubmitButton>
          </SavingForm>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <p className="text-sm text-neutral-500">Change your password.</p>
        </CardHeader>
        <CardContent>
          <SavingForm action={updatePassword} successText="Password updated." resetOnSuccess className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="password">New password</Label>
              <Input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" />
              <p className="text-xs text-neutral-500">At least 8 characters.</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm">Confirm new password</Label>
              <Input id="confirm" name="confirm" type="password" required minLength={8} autoComplete="new-password" />
            </div>
            <SubmitButton>Update password</SubmitButton>
          </SavingForm>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Passkeys</CardTitle>
          <p className="text-sm text-neutral-500">
            Sign in with your fingerprint, face or screen lock instead of typing a password. The passkey stays on your
            device — we never see it, and it cannot be phished.
          </p>
        </CardHeader>
        <CardContent>
          <RegisterPasskey />
        </CardContent>
      </Card>
    </div>
  );
}
