import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Stars } from "@/components/stars";
import { timeAgo, formatMonthYear } from "@/lib/utils";

// A client page is a hiring record, not a shop window — it exists for the one
// creative deciding whether to bid. Keep it out of search results entirely.
export const metadata: Metadata = {
  title: "Client — Ganyu Hub",
  robots: { index: false, follow: false },
};

export default async function ClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, location, headline, role, created_at")
    .eq("id", id)
    .single();
  if (!profile) notFound();

  // Creatives sell; this page doesn't describe them. Send them to their own.
  if (profile.role === "creative") redirect(`/creatives/${id}`);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/clients/${id}`);
  const isOwner = user.id === id;

  if (!isOwner) {
    const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
    // Gated to creatives: a buyer's hiring record is for people deciding
    // whether to work for them, not for the open web or rival clients.
    if (me?.role !== "creative") {
      return (
        <div className="mx-auto max-w-2xl px-4 py-16 text-center">
          <h1 className="font-display text-2xl font-semibold text-ink">Client profiles are for creatives</h1>
          <p className="mt-2 text-sm text-ink/65">
            This page shows a client&apos;s hiring record so creatives can decide whether to bid. It isn&apos;t public.
          </p>
          <Link href="/browse" className="mt-6 inline-block rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-ink/90">
            Browse creatives
          </Link>
        </div>
      );
    }
  }

  const { data: jobs } = await supabase.from("jobs").select("id, status").eq("client_id", id);
  const posted = jobs?.length || 0;
  // "Awarded" = left the open pool for a real engagement. Anything still open
  // or cancelled never became work for anyone.
  const awarded = (jobs || []).filter((j) => j.status !== "open" && j.status !== "cancelled").length;
  const completed = (jobs || []).filter((j) => j.status === "completed").length;
  const hireRate = posted > 0 ? Math.round((awarded / posted) * 100) : null;

  const { data: reviews } = await supabase
    .from("reviews")
    .select("id, rating, comment, created_at, reviewer:profiles!reviews_reviewer_id_fkey(full_name)")
    .eq("reviewee_id", id)
    .order("created_at", { ascending: false });
  const reviewCount = reviews?.length || 0;
  const avgRating = reviewCount ? reviews!.reduce((s, r) => s + r.rating, 0) / reviewCount : 0;

  const initials = (profile.full_name || "G H")
    .split(" ")
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const stats: { label: string; value: string }[] = [
    { label: "Jobs posted", value: String(posted) },
    { label: "Hired someone", value: hireRate == null ? "—" : `${hireRate}%` },
    { label: "Completed", value: String(completed) },
    { label: "On Ganyu Hub since", value: profile.created_at ? formatMonthYear(profile.created_at) : "—" },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 pb-12">
      <section className="card-soft mt-6 p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink font-display text-2xl font-semibold text-paper">
            {profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar_url} alt={profile.full_name || "Avatar"} className="h-full w-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div>
            <p className="eyebrow">Client</p>
            <h1 className="font-display text-2xl font-semibold text-ink md:text-3xl">{profile.full_name || "Unnamed"}</h1>
            <p className="mt-0.5 text-xs text-ink/55">{profile.location || "Malawi"}</p>
          </div>
          {reviewCount > 0 && (
            <span className="ml-auto inline-flex items-center gap-1.5 self-start text-sm">
              <Stars value={avgRating} className="h-4 w-4" />
              <span className="font-semibold text-ink">{avgRating.toFixed(1)}</span>
              <span className="text-ink/55">· {reviewCount}</span>
            </span>
          )}
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-ink/10 pt-4 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label}>
              <dt className="text-xs uppercase tracking-wide text-ink/50">{s.label}</dt>
              <dd className="mt-0.5 font-display text-lg font-medium tabular-nums text-ink">{s.value}</dd>
            </div>
          ))}
        </dl>

        {posted === 0 && (
          <p className="mt-4 border-t border-ink/10 pt-4 text-sm text-ink/60">
            This client hasn&apos;t posted a job yet, so there&apos;s no track record to show.
          </p>
        )}
      </section>

      <section className="card-soft mt-6 p-6">
        <p className="eyebrow">Reviews from creatives</p>
        {reviewCount === 0 ? (
          <p className="mt-2 text-sm text-ink/60">
            No creative has reviewed this client yet. Reviews appear once a job is completed.
          </p>
        ) : (
          <ul className="mt-4 space-y-4">
            {(reviews || []).map((r: any) => (
              <li key={r.id} className="border-t border-ink/10 pt-4 first:border-0 first:pt-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-ink">{r.reviewer?.full_name || "A creative"}</p>
                  <Stars value={r.rating} className="h-3.5 w-3.5" />
                </div>
                {r.comment && <p className="mt-1.5 whitespace-pre-wrap text-sm text-ink/75">{r.comment}</p>}
                <p className="mt-1 text-xs text-ink/45">{timeAgo(r.created_at)}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ponytail: no escrow-release speed yet. The data now exists — a
          payment_released job_event is logged at both release sites — but it
          only accrues forward, so every client would read "—" today. Add the
          stat once real releases have been recorded: pair that event's
          created_at against the job's payment_held_at, average the delta. */}
    </div>
  );
}
