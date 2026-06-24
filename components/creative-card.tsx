import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatMwk } from "@/lib/utils";
import type { Profile } from "@/lib/types";

export function CreativeCard({ profile }: { profile: Profile }) {
  return (
    <Link href={`/creatives/${profile.id}`}>
      <Card className="h-full transition hover:border-brand">
        <CardContent className="p-5">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-neutral-200" />
            <div>
              <p className="font-semibold">{profile.full_name || "Unnamed creative"}</p>
              <p className="text-xs text-neutral-500">{profile.location || "Malawi"}</p>
            </div>
          </div>
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
        </CardContent>
      </Card>
    </Link>
  );
}
