import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/supabase/user";
import { chooseRole } from "@/app/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// One-time role step for Google/OAuth users, who sign up without the role radio
// the email form has. Email users already have a role → guarded straight past.
export default async function ChooseRolePage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const supabase = createClient();
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role, onboarded_at").eq("id", user.id).single();
  if (profile?.onboarded_at) redirect("/dashboard");
  if (profile?.role) redirect(profile.role === "client" ? "/onboarding/client" : "/onboarding/creative");

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <Card>
        <CardHeader><CardTitle>One quick question</CardTitle></CardHeader>
        <CardContent>
          <p className="mb-5 text-sm text-ink/65">How will you use Ganyu Hub? You can&apos;t change this later, so pick the one that fits.</p>
          {error && (
            <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {decodeURIComponent(error)}
            </p>
          )}
          <div className="space-y-3">
            <form action={chooseRole}>
              <input type="hidden" name="role" value="creative" />
              <Button type="submit" variant="outline" className="h-auto w-full flex-col items-start gap-1 py-3 text-left">
                <span className="font-medium">I&apos;m a creative</span>
                <span className="text-xs font-normal text-ink/55">I want to show my work and get hired.</span>
              </Button>
            </form>
            <form action={chooseRole}>
              <input type="hidden" name="role" value="client" />
              <Button type="submit" variant="outline" className="h-auto w-full flex-col items-start gap-1 py-3 text-left">
                <span className="font-medium">I&apos;m a client</span>
                <span className="text-xs font-normal text-ink/55">I want to hire creatives for work.</span>
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
