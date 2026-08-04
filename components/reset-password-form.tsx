"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function ResetPasswordForm() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <div className="space-y-4">
        <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          Password updated. Sign in with your new password to continue.
        </p>
        <Link href="/login" className="block">
          <Button className="w-full">Sign in now</Button>
        </Link>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const password = String(fd.get("password") || "");
    const confirm = String(fd.get("confirm") || "");
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm) { setError("Passwords don't match."); return; }
    setPending(true);
    const supabase = createClient();
    const { error: updateErr } = await supabase.auth.updateUser({ password });
    if (updateErr) { setError(updateErr.message); setPending(false); return; }
    await supabase.auth.signOut({ scope: "global" });
    setDone(true);
    setPending(false);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="password">New password</Label>
        <Input id="password" name="password" type="password" required minLength={8} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="confirm">Confirm password</Label>
        <Input id="confirm" name="confirm" type="password" required minLength={8} />
      </div>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Updating…" : "Update password"}
      </Button>
    </form>
  );
}
