import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
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

  const primaryCat = (profile.categories || [])[0];
  const { data: similar } = primaryCat
    ? await supabase
        .from("profiles")
        .select("id, full_name, headline, categories")
        .neq("id", profile.id)
        .contains("categories", [primaryCat])
        .limit(4)
    : { data: [] as any[] };

  const initials = (profile.full_name || "G H")
    .split(" ")
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="mx-auto max-w-5xl px-4 pb-12">
      <section className="card-soft mt-6 overflow-hidden">
        <div className="h-36 bg-gradient-to-br from-wash via-paper to-wash md:h-48" />
        <div className="px-6 pb-6">
          <div className="-mt-12 flex flex-col gap-4 md:-mt-14 md:flex-row md:items-end md:justify-between">
            <div className="flex items-end gap-4">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-4 border-paper bg-ink text-2xl font-display font-semibold text-paper shadow-md md:h-28 md:w-28">
                {initials}
              </div>
              <div className="pb-1">
                <h1 className="font-display text-3xl font-semibold text-ink md:text-4xl">{profile.full_name || "Unnamed"}</h1>
                <p className="mt-1 text-sm text-ink/70 md:text-base">{profile.headline || "No headline yet."}</p>
                <p className="mt-0.5 text-xs text-ink/55">{profile.location || "Malawi"}</p>
              </div>
            </div>
            {user && user.id !== profile.id && (
              <div className="flex items-center gap-2">
                <form action={startThread}>
                  <input type="hidden" name="creative_id" value={profile.id} />
                  <Button type="submit">Message</Button>
                </form>
                <SaveButton targetType="creative" targetId={profile.id} saved={isSaved} />
              </div>
            )}
          </div>

          {(profile.categories || []).length > 0 && (
            <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-ink/10 pt-4">
              {(profile.categories || []).map((c: string) => (
                <span key={c} className="rounded-full bg-wash/70 px-3 py-1 text-xs text-ink/75">{c}</span>
              ))}
              {(services?.length || 0) > 0 && (
                <span className="ml-auto text-sm font-medium text-ink">From {formatMwk(services![0].price_mwk)}</span>
              )}
            </div>
          )}
        </div>
      </section>

      <div className="mt-6 grid gap-6 md:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-6">
          {profile.bio && (
            <section className="card-soft p-6">
              <p className="eyebrow">About</p>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink/80">{profile.bio}</p>
            </section>
          )}

          {(profile.skills || []).length > 0 && (
            <section className="card-soft p-6">
              <p className="eyebrow">Skills</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {profile.skills!.map((s: string) => (
                  <span key={s} className="rounded-full bg-ink/5 px-3 py-1 text-xs text-ink/80">{s}</span>
                ))}
              </div>
            </section>
          )}

          <section className="card-soft p-6">
            <div className="flex items-baseline justify-between">
              <p className="eyebrow">Rate card</p>
              <span className="text-xs text-ink/55">Starting prices</span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {(services || []).map((s: any) => (
                <div key={s.id} className="rounded-lg border border-ink/10 bg-paper p-4">
                  <p className="font-medium text-ink">{s.title}</p>
                  {s.description && <p className="mt-1 line-clamp-2 text-xs text-ink/65">{s.description}</p>}
                  <p className="mt-3 text-sm">
                    <span className="font-semibold text-ink">{formatMwk(s.price_mwk)}</span>
                    {s.price_mwk_max && <span className="text-ink/65"> – {formatMwk(s.price_mwk_max)}</span>}
                    <span className="text-ink/55"> · ~{s.delivery_days}d</span>
                  </p>
                </div>
              ))}
              {(!services || services.length === 0) && (
                <p className="text-sm text-ink/55">No services listed yet.</p>
              )}
            </div>
          </section>

          <section className="card-soft p-6">
            <p className="eyebrow">Portfolio</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {(portfolio || []).map((p) => (
                <div key={p.id} className="overflow-hidden rounded-lg border border-ink/10 bg-paper">
                  {p.cover_url && <img src={p.cover_url} alt={p.title} className="aspect-video w-full object-cover" />}
                  <div className="p-4">
                    <p className="font-medium text-ink">{p.title}</p>
                    {p.description && <p className="mt-1 line-clamp-3 text-xs text-ink/65">{p.description}</p>}
                    {p.project_url && (
                      <a href={p.project_url} target="_blank" rel="noopener" className="mt-2 inline-block text-xs font-medium text-stamp hover:underline">
                        View project →
                      </a>
                    )}
                  </div>
                </div>
              ))}
              {(!portfolio || portfolio.length === 0) && <p className="text-sm text-ink/55">No portfolio items yet.</p>}
            </div>
          </section>

          {user && user.id !== profile.id && (
            <section className="card-soft p-6">
              <p className="eyebrow">Custom quote</p>
              <p className="mt-1 text-sm text-ink/65">
                Don&apos;t see what you need? Describe it and {profile.full_name?.split(" ")[0] || "this creative"} will reply with a price.
              </p>
              <SavingForm action={requestCustomService} className="mt-4 space-y-3">
                <input type="hidden" name="creative_id" value={profile.id} />
                <div className="space-y-1.5">
                  <Label htmlFor="request_text" className="sr-only">What do you need?</Label>
                  <Textarea id="request_text" name="request_text" rows={4} required placeholder="e.g. I need 500 business cards designed and printed, double-sided." />
                </div>
                <SubmitButton pendingText="Sending…">Request a custom quote</SubmitButton>
              </SavingForm>
            </section>
          )}
        </div>

        <aside className="space-y-6">
          <section className="card-soft p-5">
            <p className="eyebrow">At a glance</p>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink/60">Location</dt>
                <dd className="text-ink">{profile.location || "Malawi"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink/60">Services</dt>
                <dd className="text-ink">{services?.length || 0}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink/60">Portfolio</dt>
                <dd className="text-ink">{portfolio?.length || 0}</dd>
              </div>
            </dl>
          </section>

          {(similar?.length || 0) > 0 && (
            <section className="card-soft p-5">
              <p className="eyebrow">People also viewed</p>
              <ul className="mt-3 space-y-3">
                {(similar || []).map((s: any) => (
                  <li key={s.id}>
                    <Link href={`/creatives/${s.id}`} className="group flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink/85 text-sm font-medium text-paper">
                        {(s.full_name || "?")
                          .split(" ")
                          .map((n: string) => n[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink group-hover:underline">{s.full_name || "Unnamed"}</p>
                        <p className="truncate text-xs text-ink/60">{s.headline || (s.categories || [])[0] || "Creative"}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
