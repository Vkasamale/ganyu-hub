import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/supabase/user";
import { signUp } from "@/app/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Turnstile } from "@/components/turnstile";
import { GoogleSignin } from "@/components/google-signin";

type Role = "creative" | "client" | "agency";
const VALID_ROLES: Role[] = ["creative", "client", "agency"];

export default async function SignupPage({ searchParams: searchParamsP }: { searchParams?: Promise<{ role?: string; error?: string }> }) {
  const searchParams = (await searchParamsP) || {};
  // A signed-in person should never be shown a login form. It is not a data
  // leak — the navbar above it is showing their own real session — but on a
  // shared device it reads as "nobody is signed in here", which is the exact
  // opposite of the truth. Someone who then hesitates or mistypes walks away
  // believing they were never signed in, leaving the previous account open.
  if (await getSessionUser()) redirect("/");

  const requested = searchParams?.role as Role | undefined;
  const initialRole: Role = requested && VALID_ROLES.includes(requested) ? requested : "creative";
  const error = searchParams?.error;
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle>Join Ganyu Hub</CardTitle>
          <CardDescription>Sign up as a creative or as a client looking to hire.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {decodeURIComponent(error)}
            </p>
          )}
          <GoogleSignin label="Sign up with Google" />
          <div className="my-4 flex items-center gap-3 text-xs text-ink/45">
            <span className="h-px flex-1 bg-grey" />or<span className="h-px flex-1 bg-grey" />
          </div>
          <form action={signUp} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="full_name">Full name</Label>
              <Input id="full_name" name="full_name" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required minLength={6} />
            </div>
            <div className="space-y-1.5">
              <Label>I am a…</Label>
              <div className="flex gap-3 text-sm">
                <label className="flex items-center gap-2">
                  <input type="radio" name="role" value="creative" defaultChecked={initialRole === "creative"} /> Creative
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="role" value="client" defaultChecked={initialRole === "client"} /> Client
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="role" value="agency" defaultChecked={initialRole === "agency"} /> Agency
                </label>
              </div>
            </div>
            <Turnstile />
            <Button type="submit" className="w-full">Create account</Button>
            <p className="text-center text-xs text-ink/55">
              By signing up you agree to our{" "}
              <Link href="/terms" className="underline hover:text-ink">Terms</Link>{" "}
              and{" "}
              <Link href="/privacy" className="underline hover:text-ink">Privacy Policy</Link>.
            </p>
            <p className="text-center text-sm text-ink/55">
              Have an account? <Link href="/login" className="text-brand-dark hover:underline">Log in</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
