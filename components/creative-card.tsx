import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SaveButton } from "@/components/save-button";
import { formatMwk } from "@/lib/utils";
import type { Profile } from "@/lib/types";

export function CreativeCard({ profile, saved = false, showSave = false }: { profile: Profile; saved?: boolean; showSave?: boolean }) {
  return (
    <Card className="h-full transition hover:border-brand">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <Link href={`/creatives/${profile.id}`} className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-neutral-200" />
            <div>
              <p className="font-semibold">{profile.full_name || "Unnamed creative"}</p>
              <p className="text-xs text-neutral-500">{profile.location || "Malawi"}</p>
            </div>
          </Link>
          {showSave && <SaveButton targetType="creative" targetId={profile.id} saved={saved} />}
        </div>
        <Link href={`/creatives/${profile.id}`} className="block">
          <p className="mt-3 line-clamp-2 text-sm text-neutral-700">
            {profile.headline || "No headline yet."}
          </p>
          <div className="mt-3 flex flex-wrap gap-1">
            {(profile.categories || []).slice(0, 3).map((c) => (
              <Badge key={c}>{c}</Badge>
            ))}
          </div>
          {profile.hourly_rate_mwk != null && (
            <p className="mt-3 text-sm font-medium">
              {formatMwk(profile.hourly_rate_mwk)}<span className="text-neutral-500 font-normal">/hr</span>
            </p>
          )}
        </Link>
      </CardContent>
    </Card>
  );
}
