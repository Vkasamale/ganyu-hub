import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default async function PortfolioItemPage({
  params,
}: {
  params: Promise<{ id: string; itemId: string }>;
}) {
  const { id, itemId } = await params;
  const supabase = createClient();

  const { data: item } = await supabase
    .from("portfolio_items")
    .select("*")
    .eq("id", itemId)
    .eq("profile_id", id)
    .single();
  if (!item) notFound();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, headline, avatar_url, categories, location")
    .eq("id", id)
    .single();

  const { data: moreItems } = await supabase
    .from("portfolio_items")
    .select("id, title, cover_url, description")
    .eq("profile_id", id)
    .neq("id", itemId)
    .order("created_at", { ascending: false })
    .limit(4);

  const images: string[] = [
    ...(item.cover_url ? [item.cover_url] : []),
    ...(Array.isArray(item.images) ? item.images : []),
  ];
  const hero = images[0];
  const rest = images.slice(1);

  const created = new Date(item.created_at).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  const initials = (profile?.full_name || "G H")
    .split(" ")
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16">
      <Link
        href={`/creatives/${id}`}
        className="mt-6 inline-flex items-center gap-1.5 text-sm text-ink/60 transition-colors hover:text-ink"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to {profile?.full_name || "profile"}
      </Link>

      <section className="card-soft mt-4 overflow-hidden">
        {hero ? (
          <div className="relative aspect-[16/9] w-full bg-ink/5">
            <Image
              src={hero}
              alt={item.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-cover"
            />
          </div>
        ) : (
          <div
            className="relative flex aspect-[16/6] w-full items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #069494 0%, #057a7a 55%, #045f5f 100%)",
            }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.10]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, #fff 0 1px, transparent 1px 14px)",
              }}
            />
            <p className="relative font-display text-2xl font-semibold tracking-tight text-paper/90 md:text-3xl">
              {item.title}
            </p>
          </div>
        )}

        <div className="p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-2">
            {(profile?.categories || []).slice(0, 3).map((c: string) => (
              <span key={c} className="rounded-full bg-wash/70 px-3 py-1 text-xs text-ink/75">
                {c}
              </span>
            ))}
            <span className="ml-auto text-xs text-ink/50">Added {created}</span>
          </div>
          <h1 className="mt-3 font-display text-3xl font-semibold text-ink md:text-4xl">
            {item.title}
          </h1>
          {item.project_url && (
            <a
              href={item.project_url}
              target="_blank"
              rel="noopener"
              className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper transition-colors hover:bg-ink/85"
            >
              View live project
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          )}
        </div>
      </section>

      <div className="mt-8 grid gap-8 md:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-8">
          <section className="card-soft p-6 md:p-8">
            <p className="eyebrow">About this project</p>
            {item.description ? (
              <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-ink/85">
                {item.description}
              </p>
            ) : (
              <p className="mt-3 text-sm italic text-ink/50">
                No description added yet.
              </p>
            )}
          </section>

          {rest.length > 0 && (
            <section className="card-soft p-6 md:p-8">
              <div className="flex items-baseline justify-between">
                <p className="eyebrow">Gallery</p>
                <span className="text-xs text-ink/50">{images.length} images</span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {rest.map((url, i) => (
                  <div
                    key={url}
                    className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-ink/10 bg-ink/5"
                  >
                    <Image
                      src={url}
                      alt={`${item.title} — image ${i + 2}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 480px"
                      className="object-cover transition-transform hover:scale-[1.02]"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-6">
          <section className="card-soft p-5">
            <p className="eyebrow">Creator</p>
            <Link
              href={`/creatives/${id}`}
              className="group mt-3 flex items-start gap-3"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink text-sm font-display font-semibold text-paper ring-2 ring-white">
                {profile?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatar_url} alt={profile.full_name || ""} className="h-full w-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink group-hover:underline">
                  {profile?.full_name || "Creator"}
                </p>
                {profile?.headline && (
                  <p className="mt-0.5 line-clamp-2 text-xs text-ink/65">
                    {profile.headline}
                  </p>
                )}
                {profile?.location && (
                  <p className="mt-1 text-xs text-ink/50">📍 {profile.location}</p>
                )}
              </div>
            </Link>
            <Link
              href={`/creatives/${id}`}
              className="mt-4 inline-flex w-full items-center justify-center rounded-md border border-ink/20 px-3 py-2 text-xs font-medium text-ink transition-colors hover:border-ink/40 hover:bg-wash/50"
            >
              View full profile
            </Link>
          </section>

          <section className="card-soft p-5">
            <p className="eyebrow">Project details</p>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink/55">Added</dt>
                <dd className="text-ink">{created}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink/55">Images</dt>
                <dd className="text-ink">{images.length || "—"}</dd>
              </div>
              {item.project_url && (
                <div className="flex justify-between gap-2">
                  <dt className="text-ink/55">Live link</dt>
                  <dd className="truncate">
                    <a
                      href={item.project_url}
                      target="_blank"
                      rel="noopener"
                      className="text-stamp hover:underline"
                    >
                      Open ↗
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </section>
        </aside>
      </div>

      {(moreItems?.length || 0) > 0 && (
        <section className="mt-12">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-2xl font-semibold text-ink">
              More from {profile?.full_name?.split(" ")[0] || "this creator"}
            </h2>
            <Link
              href={`/creatives/${id}`}
              className="text-sm text-stamp hover:underline"
            >
              See all →
            </Link>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(moreItems || []).map((m: any) => (
              <Link
                key={m.id}
                href={`/creatives/${id}/portfolio/${m.id}`}
                className="group overflow-hidden rounded-lg border border-ink/10 bg-paper transition-shadow hover:shadow-md"
              >
                {m.cover_url ? (
                  <div className="relative aspect-video w-full overflow-hidden bg-ink/5">
                    <Image
                      src={m.cover_url}
                      alt={m.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 25vw"
                      className="object-cover transition-transform group-hover:scale-[1.03]"
                    />
                  </div>
                ) : (
                  <div
                    className="aspect-video w-full"
                    style={{
                      background:
                        "linear-gradient(135deg, #069494 0%, #045f5f 100%)",
                    }}
                  />
                )}
                <div className="p-3">
                  <p className="line-clamp-1 text-sm font-medium text-ink group-hover:underline">
                    {m.title}
                  </p>
                  {m.description && (
                    <p className="mt-0.5 line-clamp-2 text-xs text-ink/60">
                      {m.description}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
