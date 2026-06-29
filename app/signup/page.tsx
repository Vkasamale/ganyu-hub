import Link from "next/link";
import { signUp } from "@/app/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

type Role = "creative" | "client" | "agency";
const VALID_ROLES: Role[] = ["creative", "client", "agency"];

export default function SignupPage({ searchParams }: { searchParams?: { role?: string } }) {
  const requested = searchParams?.role as Role | undefined;
  const initialRole: Role = requested && VALID_ROLES.includes(requested) ? requested : "creative";
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle>Join Ganyu Hub</CardTitle>
          <CardDescription>Sign up as a creative or as a client looking to hire.</CardDescription>
        </CardHeader>
        <CardContent>
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
            <Button type="submit" className="w-full">Create account</Button>
            <p className="text-center text-sm text-neutral-500">
              Have an account? <Link href="/login" className="text-brand hover:underline">Log in</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
