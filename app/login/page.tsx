import Link from "next/link";
import { signIn } from "@/app/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Turnstile } from "@/components/turnstile";
import { GoogleSignin } from "@/components/google-signin";
import { PasskeySignIn } from "@/components/passkey";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; info?: string }> }) {
  const { error, info } = await searchParams;
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <Card>
        <CardHeader><CardTitle>Welcome back</CardTitle></CardHeader>
        <CardContent>
          {info && (
            <p className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              {decodeURIComponent(info)}
            </p>
          )}
          {error && (
            <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {decodeURIComponent(error)}
            </p>
          )}
          <div className="space-y-2">
            <GoogleSignin />
            <PasskeySignIn />
          </div>
          <div className="my-4 flex items-center gap-3 text-xs text-neutral-400">
            <span className="h-px flex-1 bg-neutral-200" />or<span className="h-px flex-1 bg-neutral-200" />
          </div>
          <form action={signIn} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <Turnstile />
            <Button type="submit" className="w-full">Log in</Button>
            <p className="text-center text-sm">
              <Link href="/forgot-password" className="text-brand-dark hover:underline">Forgot password?</Link>
            </p>
            <p className="text-center text-sm text-neutral-500">
              No account? <Link href="/signup" className="text-brand-dark hover:underline">Sign up</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
