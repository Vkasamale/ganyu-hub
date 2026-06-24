import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  const tiles = [
    { href: "/dashboard/profile", title: "Edit profile", desc: "Update your bio, skills, and rate." },
    { href: "/dashboard/portfolio", title: "Portfolio", desc: "Add and manage portfolio items." },
    { href: "/dashboard/proposals", title: "Proposals", desc: "Track proposals you have sent or received." },
    { href: "/messages", title: "Messages", desc: "Your conversations." },
    { href: `/creatives/${user.id}`, title: "View public profile", desc: "See what clients see." },
    { href: "/jobs/new", title: "Post a job", desc: "Looking to hire? Start here." },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold">Welcome, {profile?.full_name || "there"}</h1>
      <p className="mt-1 text-neutral-600">You are signed in as a <strong>{profile?.role}</strong>.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((t) => (
          <Link key={t.href} href={t.href}>
            <Card className="h-full transition hover:border-brand">
              <CardContent className="p-5">
                <p className="font-semibold">{t.title}</p>
                <p className="mt-1 text-sm text-neutral-600">{t.desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
