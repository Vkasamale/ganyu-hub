import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { CreativeCard } from "@/components/creative-card";
import { JobCard } from "@/components/job-card";
import { getForYouJobs, getForYouCreatives, getTrending, getSavedIds } from "@/lib/feed";

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const isClient = profile?.role === "client";

  const [forYou, trending, savedJobIds, savedCreativeIds] = await Promise.all([
    isClient ? getForYouCreatives(supabase as any, user.id) : getForYouJobs(supabase as any, user.id),
    isClient ? getTrending(supabase as any, "creative") : getTrending(supabase as any, "job"),
    getSavedIds(supabase as any, user.id, "job"),
    getSavedIds(supabase as any, user.id, "creative"),
  ]);

  const tiles = [
    { href: "/dashboard/profile", title: "Edit profile" },
    { href: "/dashboard/portfolio", title: "Portfolio" },
    { href: "/dashboard/proposals", title: "Proposals" },
    { href: "/dashboard/saved", title: "Saved" },
    { href: "/messages", title: "Messages" },
    { href: `/creatives/${user.id}`, title: "Public profile" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 space-y-10">
      <div>
        <h1 className="text-3xl font-bold">Welcome, {profile?.full_name || "there"}</h1>
        <p className="mt-1 text-neutral-600">Signed in as <strong>{profile?.role}</strong>.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {tiles.map((t) => (
          <Link key={t.href} href={t.href}>
            <Card className="h-full transition hover:border-brand">
              <CardContent className="p-4 text-sm font-medium">{t.title}</CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">For you</h2>
          <Link href={isClient ? "/browse" : "/jobs"} className="text-sm text-brand hover:underline">See all</Link>
        </div>
        <p className="mt-1 text-sm text-neutral-500">
          {isClient ? "Creatives matching the categories of jobs you have posted." : "Jobs matching the categories on your profile."}
        </p>
        <div className={`mt-4 grid gap-4 ${isClient ? "sm:grid-cols-2 lg:grid-cols-3" : ""}`}>
          {isClient
            ? (forYou as any[]).map((p) => <CreativeCard key={p.id} profile={p} saved={savedCreativeIds.has(p.id)} showSave />)
            : (forYou as any[]).map((j) => <JobCard key={j.id} job={j} saved={savedJobIds.has(j.id)} showSave />)}
          {(forYou as any[]).length === 0 && <p className="text-neutral-500">Set some categories on your profile (or post a job) to get personalized picks.</p>}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Trending this week</h2>
          <Link href={isClient ? "/browse" : "/jobs"} className="text-sm text-brand hover:underline">See all</Link>
        </div>
        <div className={`mt-4 grid gap-4 ${isClient ? "sm:grid-cols-2 lg:grid-cols-3" : ""}`}>
          {isClient
            ? (trending as any[]).map((p) => <CreativeCard key={p.id} profile={p} saved={savedCreativeIds.has(p.id)} showSave />)
            : (trending as any[]).map((j) => <JobCard key={j.id} job={j} saved={savedJobIds.has(j.id)} showSave />)}
          {(trending as any[]).length === 0 && <p className="text-neutral-500">Nothing trending yet. Check back soon.</p>}
        </div>
      </section>
    </div>
  );
}
