import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SaveButton } from "@/components/save-button";
import { SavingForm, SubmitButton } from "@/components/saving-form";
import { startThread, recordView, requestCustomService } from "@/app/actions";
import { formatMwk } from "@/lib/utils";

export default async function CreativePage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", params.id).single();
  if (!profile) notFound();
  const { data: portfolio } = await supabase.from("portfolio_items").select("*").eq("profile_id", params.id).order("created_at", { ascending: false });
  const { data: services } = await supabase.from("services").select("*").eq("profile_id", params.id).order("price_mwk", { ascending: true });
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
          {(services?.length || 0) > 0 && (
            <p className="mt-3 text-lg font-semibold">From {formatMwk(services![0].price_mwk)}</p>
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
        <h2 className="text-xl font-semibold">Rate card</h2>
        <p className="mt-1 text-sm text-neutral-500">Services {profile.full_name?.split(" ")[0] || "this creative"} offers, with starting prices.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {(services || []).map((s: any) => (
            <Card key={s.id}>
              <CardContent className="p-5">
                <p className="font-semibold">{s.title}</p>
                {s.description && <p className="mt-1 text-sm text-neutral-600 whitespace-pre-wrap">{s.description}</p>}
                <p className="mt-3 text-sm">
                  <span className="font-medium">{formatMwk(s.price_mwk)}</span>
                  {s.price_mwk_max && <span> &ndash; {formatMwk(s.price_mwk_max)}</span>}
                  <span className="text-neutral-500"> &middot; ~{s.delivery_days} day{s.delivery_days === 1 ? "" : "s"}</span>
                </p>
              </CardContent>
            </Card>
          ))}
          {(!services || services.length === 0) && (
            <p className="text-neutral-500">No services listed yet. Use the form below to ask for a custom quote.</p>
          )}
        </div>
      </section>

      {user && user.id !== profile.id && (
        <section className="mt-10">
          <Card>
            <CardHeader>
              <CardTitle>Don&apos;t see what you need?</CardTitle>
              <p className="text-sm text-neutral-500">Describe what you&apos;re looking for and {profile.full_name?.split(" ")[0] || "this creative"} will reply with a quote.</p>
            </CardHeader>
            <CardContent>
              <SavingForm action={requestCustomService} className="space-y-4">
                <input type="hidden" name="creative_id" value={profile.id} />
                <div className="space-y-1.5">
                  <Label htmlFor="request_text">What do you need?</Label>
                  <Textarea id="request_text" name="request_text" rows={4} required placeholder="e.g. I need 500 business cards designed and printed, double-sided." />
                </div>
                <SubmitButton pendingText="Sending…">Request a custom quote</SubmitButton>
              </SavingForm>
            </CardContent>
          </Card>
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
