import Link from "next/link";
import Image from "next/image";
import { SaveButton } from "@/components/save-button";
import { formatMwk } from "@/lib/utils";
import type { Profile } from "@/lib/types";

function initialsOf(name: string | null): string {
  return (name || "G H")
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function CreativeCard({
  profile,
  saved = false,
  showSave = false,
  fromPriceMwk = null,
  rating = null,
  reviewCount = 0,
}: {
  profile: Profile;
  saved?: boolean;
  showSave?: boolean;
  fromPriceMwk?: number | null;
  rating?: number | null;
  reviewCount?: number;
}) {
  const initials = initialsOf(profile.full_name);
  const primaryCategory = profile.categories?.[0];
  const allSkills = profile.skills || [];
  const topSkills = allSkills.slice(0, 3);
  // §M9: say how many were cut. Truncating silently makes a ten-skill creative
  // look like a three-skill one.
  const moreSkills = allSkills.length - topSkills.length;
  const priceLabel = fromPriceMwk != null ? `From ${formatMwk(fromPriceMwk)}` : "Custom pricing";

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-[14px] border border-ink/[0.08] bg-raised shadow-elev-1 transition-all duration-100 ease-out hover:-translate-y-0.5 hover:shadow-elev-2">
      {showSave && (
        <div className="absolute right-3 top-3 z-10">
          <SaveButton targetType="creative" targetId={profile.id} saved={saved} />
        </div>
      )}

      <Link href={`/creatives/${profile.id}`} className="block">
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          {profile.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={profile.full_name || "Creative"}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center"
              style={{
                background:
                  "radial-gradient(120% 80% at 30% 30%, #069494 0%, #046B6B 55%, #023939 100%)",
              }}
            >
              <span
                className="font-display text-5xl font-semibold text-paper md:text-6xl"
                style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100' }}
              >
                {initials}
              </span>
            </div>
          )}
          {primaryCategory && (
            <span className="absolute bottom-3 left-3 rounded-full bg-paper/95 px-3 py-1 text-[11px] font-medium text-ink shadow-sm backdrop-blur">
              {primaryCategory}
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link href={`/creatives/${profile.id}`} className="flex items-center gap-2.5">
          <div className="relative shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ink/85 text-[11px] font-semibold text-paper">
              {initials}
            </div>
            {profile.availability && profile.availability !== "available" && (
              <span
                title={profile.availability === "busy" ? "Busy" : "Not taking work"}
                className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-white ${
                  profile.availability === "busy" ? "bg-yellow-400" : "bg-neutral-400"
                }`}
              />
            )}
            {profile.availability === "available" && (
              <span title="Available" className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white" />
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">{profile.full_name || "Unnamed creative"}</p>
            <p className="truncate text-[11px] text-ink/55">{profile.location || "Malawi"}</p>
          </div>
        </Link>

        <Link href={`/creatives/${profile.id}`} className="mt-3 block">
          <p className="line-clamp-1 text-sm text-ink/80">
            {profile.headline || "Available for work."}
          </p>
        </Link>

        {topSkills.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {topSkills.map((s) => (
              <span key={s} className="rounded-full bg-ink/5 px-2.5 py-0.5 text-[10px] font-medium text-ink/70">
                {s}
              </span>
            ))}
            {moreSkills > 0 && (
              <span
                title={allSkills.slice(3).join(", ")}
                className="rounded-full px-1.5 py-0.5 text-[10px] font-medium text-ink/45"
              >
                +{moreSkills}
              </span>
            )}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between border-t border-ink/10 pt-3">
          <div className="flex items-center gap-1 text-xs text-ink/60">
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className={`h-3.5 w-3.5 ${reviewCount > 0 ? "text-amber-400" : "text-ink/30"}`}
            >
              <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
            {reviewCount > 0 && rating != null ? (
              <>
                <span className="font-medium text-ink/80">{rating.toFixed(1)}</span>
                <span className="text-ink/40">· {reviewCount} review{reviewCount === 1 ? "" : "s"}</span>
              </>
            ) : (
              <>
                <span className="font-medium text-ink/70">New</span>
                <span className="text-ink/40">· no reviews yet</span>
              </>
            )}
          </div>
          <p className="text-sm font-semibold text-ink">{priceLabel}</p>
        </div>
      </div>
    </div>
  );
}
