import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SaveButton } from "@/components/save-button";
import { startThread, recordView } from "@/app/actions";
import { formatMwk } from "@/lib/utils";

export default async function CreativePage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", params.id).single();
  if (!profile) notFound();
  const { data: portfolio } = await supabase.from("portfolio_items").select("*").eq("profile_id", params.id).order("created_at", { ascending: false });
  const { data: { user } } = await supabase.auth.getUser();
  if (user && user.id !== params.id) await recordView("creative", params.id);
  let isSaved = false;
  if (user) {
    const { data: s } = await supabase.from("saved_items").select("id").eq("user_id", user.id).eq("target_type", "creative").eq("target_id", params.id).maybeSingle();
    isSaved = !!s;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        <div className="h-24 w-24 rounded-full bg-neutral-200" />
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{profile.full_name || "Unnamed"}</h1>
          <p className="mt-1 text-neutral-600">{profile.headline || "No headline yet."}</p>
          <p className="mt-1 text-sm text-neutral-500">{profile.location || "Malawi"}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(profile.categories || []).map((c: string) => <Badge key={c}>{c}</Badge>)}
          </div>
          {profile.hourly_rate_mwk != null && (
            <p className="mt-3 text-lg font-semibold">{formatMwk(profile.hourly_rate_mwk)}/hr</p>
          )}
          {user && user.id !== profile.id && (
            <div className="mt-4 flex items-center gap-2">
              <form action={startThread}>
                <input type="hidden" name="creative_id" value={profile.id} />
                <Button type="submit">Message {profile.full_name?.split(" ")[0] || "this creative"}</Button>
              </form>
              <SaveButton targetType="creative" targetId={profile.id} saved={isSaved} />
            </div>
          )}
        </div>
      </div>

      {profile.bio && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold">About</h2>
          <p className="mt-2 whitespace-pre-wrap text-neutral-700">{profile.bio}</p>
        </section>
      )}

      {(profile.skills || []).length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold">Skills</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {profile.skills!.map((s: string) => <Badge key={s}>{s}</Badge>)}
          </div>
        </section>
      )}

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Portfolio</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(portfolio || []).map((p) => (
            <Card key={p.id}>
              {p.cover_url && <img src={p.cover_url} alt={p.title} className="aspect-video w-full rounded-t-lg object-cover" />}
              <CardContent className="p-4">
                <p className="font-semibold">{p.title}</p>
                {p.description && <p className="mt-1 line-clamp-3 text-sm text-neutral-600">{p.description}</p>}
                {p.project_url && <a href={p.project_url} target="_blank" rel="noopener" className="mt-2 inline-block text-sm text-brand hover:underline">View project →</a>}
              </CardContent>
            </Card>
          ))}
          {(!portfolio || portfolio.length === 0) && <p className="text-neutral-500">No portfolio items yet.</p>}
        </div>
      </section>
    </div>
  );
}
