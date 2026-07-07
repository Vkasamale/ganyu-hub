import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SaveButton } from "@/components/save-button";
import { SavingForm, SubmitButton } from "@/components/saving-form";
import { startThread, recordView, requestCustomService } from "@/app/actions";
import { Stars } from "@/components/stars";
import { formatMwk, timeAgo } from "@/lib/utils";
import { checkProfileComplete } from "@/lib/profile-complete";

export default async function CreativePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createClient();
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", id).single();
  if (!profile) notFound();
  const { data: portfolio } = await supabase.from("portfolio_items").select("*").eq("profile_id", id).order("created_at", { ascending: false });
  const { data: services } = await supabase.from("services").select("*").eq("profile_id", id).order("price_mwk", { ascending: true });
  const { data: { user } } = await supabase.auth.getUser();
  const isOwner = !!user && user.id === id;
  if (user && !isOwner) await recordView("creative", id);

  let isSaved = false;
  if (user && !isOwner) {
    const { data: s } = await supabase.from("saved_items").select("id").eq("user_id", user.id).eq("target_type", "creative").eq("target_id", id).maybeSingle();
    isSaved = !!s;
  }

  const { data: reviews } = await supabase
    .from("reviews")
    .select("id, rating, comment, created_at, reviewer:profiles!reviews_reviewer_id_fkey(full_name)")
    .eq("reviewee_id", id)
    .order("created_at", { ascending: false });
  const reviewCount = reviews?.length || 0;
  const avgRating = reviewCount
    ? (reviews!.reduce((sum, r) => sum + r.rating, 0) / reviewCount)
    : 0;

  const portfolioCount = portfolio?.length || 0;
  const serviceCount = services?.length || 0;
  const completeness = checkProfileComplete(profile, portfolioCount, serviceCount);

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

  const memberSince = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString(undefined, { month: "long", year: "numeric" })
    : null;

  return (
    <div className="mx-auto max-w-5xl px-4 pb-12">
      {isOwner && !completeness.complete && (
        <div className="mt-6 rounded-xl border border-amber-300 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-900">
            Your profile is incomplete and not visible to clients.
          </p>
          <p className="mt-1 text-xs text-amber-900/80">Complete these to go live:</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {completeness.missing.map((m) => (
              <li key={m.key}>
                <Link
                  href={m.href}
                  className="inline-flex items-center gap-1 rounded-full bg-amber-900 px-3 py-1 text-xs font-medium text-amber-50 hover:bg-amber-800"
                >
                  {m.label} →
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <section className="card-soft mt-6 overflow-hidden">
        <div
          className="relative h-44 md:h-56"
          style={
            profile.cover_url
              ? { backgroundImage: `url(${profile.cover_url})`, backgroundSize: "cover", backgroundPosition: "center" }
              : { background: "linear-gradient(135deg, #069494 0%, #057a7a 55%, #045f5f 100%)" }
          }
        >
          {!profile.cover_url && (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.10]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, #fff 0 1px, transparent 1px 14px)",
              }}
            />
          )}
          {!profile.cover_url && (
            <span
              aria-hidden
              className="pointer-events-none absolute bottom-4 right-6 font-display text-4xl font-semibold tracking-tight text-paper/20 md:text-5xl"
              style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100, "WONK" 1' }}
            >
              Ganyu Hub
            </span>
          )}
          {/* Bottom scrim so name/headline stay legible over any cover image */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink/55 to-transparent"
          />
          {isOwner && (
            <Link
              href="/dashboard/profile"
              className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-ink/60 px-3 py-1.5 text-xs font-medium text-paper backdrop-blur transition-colors hover:bg-ink/80"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              Add cover photo
            </Link>
          )}
        </div>

        <div className="px-6 pb-6">
          <div className="relative z-10 -mt-16 flex flex-col gap-4 md:-mt-20 md:flex-row md:items-end md:justify-between">
            <div className="flex items-end gap-4">
              <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink text-3xl font-display font-semibold text-paper shadow-lg ring-4 ring-white md:h-36 md:w-36 md:text-4xl">
                {profile.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatar_url} alt={profile.full_name || "Avatar"} className="h-full w-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <div className="pb-1">
                <h1 className="font-display text-3xl font-semibold text-ink md:text-4xl">{profile.full_name || "Unnamed"}</h1>
                {profile.headline ? (
                  <p className="mt-1 text-sm text-ink/70 md:text-base">{profile.headline}</p>
                ) : isOwner ? (
                  <Link href="/dashboard/account" className="mt-1 inline-block text-sm text-stamp underline decoration-stamp/40 underline-offset-4 hover:decoration-stamp md:text-base">
                    No headline yet — Add one
                  </Link>
                ) : null}
                <p className="mt-0.5 text-xs text-ink/55">{profile.location || "Malawi"}</p>
              </div>
            </div>
            {user && !isOwner && (
              <div className="flex items-center gap-2">
                <SavingForm action={startThread} silent>
                  <input type="hidden" name="creative_id" value={profile.id} />
                  <Button type="submit">Message</Button>
                </SavingForm>
                <SaveButton targetType="creative" targetId={profile.id} saved={isSaved} />
              </div>
            )}
          </div>

          {(profile.categories || []).length > 0 && (
            <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-ink/10 pt-4">
              {(profile.categories || []).map((c: string) => (
                <span key={c} className="rounded-full bg-wash/70 px-3 py-1 text-xs text-ink/75">{c}</span>
              ))}
              {serviceCount > 0 && (
                <span className="ml-auto inline-flex items-center gap-1.5 text-sm font-medium text-ink">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-ink/70">
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                  Services from {formatMwk(services![0].price_mwk)}
                </span>
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
              {serviceCount === 0 && (
                <p className="text-sm text-ink/55">No services listed yet.</p>
              )}
            </div>
          </section>

          {(portfolioCount > 0 || isOwner) && (
            <section className="card-soft p-6">
              <p className="eyebrow">Portfolio</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {(portfolio || []).map((p) => {
                  const extra = Array.isArray(p.images) ? p.images.length : 0;
                  return (
                    <Link
                      key={p.id}
                      href={`/creatives/${profile.id}/portfolio/${p.id}`}
                      className="group overflow-hidden rounded-lg border border-ink/10 bg-paper transition-shadow hover:shadow-md"
                    >
                      {p.cover_url && (
                        <div className="relative aspect-video w-full overflow-hidden">
                          <Image src={p.cover_url} alt={p.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
                          {extra > 0 && (
                            <span className="absolute right-2 top-2 rounded-full bg-ink/85 px-2 py-0.5 text-[10px] font-medium text-paper">
                              +{extra} more
                            </span>
                          )}
                        </div>
                      )}
                      <div className="p-4">
                        <p className="font-medium text-ink group-hover:underline">{p.title}</p>
                        {p.description && <p className="mt-1 line-clamp-3 text-xs text-ink/65">{p.description}</p>}
                      </div>
                    </Link>
                  );
                })}
                {portfolioCount === 0 && isOwner && (
                  <Link href="/dashboard/portfolio" className="rounded-lg border border-dashed border-ink/25 p-6 text-center text-sm text-ink/60 hover:border-ink/45 hover:text-ink">
                    + Add your first portfolio item
                  </Link>
                )}
              </div>
            </section>
          )}

          {reviewCount > 0 && (
            <section className="card-soft p-6">
              <div className="flex items-center justify-between">
                <p className="eyebrow">Reviews</p>
                <span className="inline-flex items-center gap-1.5 text-sm">
                  <Stars value={avgRating} className="h-4 w-4" />
                  <span className="font-semibold text-ink">{avgRating.toFixed(1)}</span>
                  <span className="text-ink/55">· {reviewCount}</span>
                </span>
              </div>
              <ul className="mt-4 space-y-4">
                {(reviews || []).map((r: any) => (
                  <li key={r.id} className="border-t border-ink/10 pt-4 first:border-0 first:pt-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-ink">{r.reviewer?.full_name || "A client"}</p>
                      <Stars value={r.rating} className="h-3.5 w-3.5" />
                    </div>
                    {r.comment && <p className="mt-1.5 whitespace-pre-wrap text-sm text-ink/75">{r.comment}</p>}
                    <p className="mt-1 text-xs text-ink/45">{timeAgo(r.created_at)}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {user && !isOwner && (
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
                <dd className="text-ink">{serviceCount}</dd>
              </div>
              {(portfolioCount > 0 || isOwner) && (
                <div className="flex justify-between">
                  <dt className="text-ink/60">Portfolio</dt>
                  <dd className="text-ink">{portfolioCount}</dd>
                </div>
              )}
              {memberSince && (
                <div className="flex justify-between">
                  <dt className="text-ink/60">Member since</dt>
                  <dd className="text-ink">{memberSince}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-ink/60">Rating</dt>
                <dd className="text-ink">
                  {reviewCount > 0 ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Stars value={avgRating} className="h-3.5 w-3.5" />
                      <span className="font-medium">{avgRating.toFixed(1)}</span>
                      <span className="text-ink/55">({reviewCount})</span>
                    </span>
                  ) : (
                    <span className="text-ink/55">No reviews yet</span>
                  )}
                </dd>
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
