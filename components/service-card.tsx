import { Star } from "lucide-react";
import { formatMwk } from "@/lib/utils";

/**
 * Item 47 (§C, §O4) — the service card shape: image, rating, title,
 * **From MWK X**.
 *
 * Two honest departures from the spec, both §Q7 ("never a fabricated number"):
 *
 * - There is no per-service rating and no per-service image in the schema.
 *   Rather than a migration nobody can backfill, the cover comes from the
 *   creative's newest portfolio piece and the rating is the creative's, LABELLED
 *   as the creative's. A per-service 4.8 nobody earned is worse than no number.
 * - No ♡ here. `target_kind` is ('job','creative') only, and this card already
 *   sits on the creative's page where the real ♡ lives — a second heart that
 *   silently saves something else is a lie about what the click did.
 *
 * "From" leads because price_mwk is the low end of a span, not the price.
 */
export function ServiceCard({
  service,
  coverUrl,
  rating,
}: {
  service: {
    id: string;
    title: string;
    description: string | null;
    price_mwk: number | null;
    price_mwk_max: number | null;
    delivery_days: number | null;
  };
  /** Newest portfolio cover, or null when the creative has uploaded none. */
  coverUrl: string | null;
  /** The creative's rating. Null below the first review — no zero shown. */
  rating: { avg: number; count: number } | null;
}) {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-ink/10 bg-paper">
      {coverUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={coverUrl} alt="" className="h-32 w-full object-cover" loading="lazy" />
      )}

      <div className="flex flex-1 flex-col p-4">
        <p className="font-medium text-ink">{service.title}</p>

        {service.description && (
          <p className="mt-1 line-clamp-2 text-xs text-ink/65">{service.description}</p>
        )}

        {rating && (
          <p className="mt-2 flex items-center gap-1 text-xs text-ink/55">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden />
            <span className="font-medium text-ink/80">{rating.avg.toFixed(1)}</span>
            <span>
              across {rating.count} review{rating.count === 1 ? "" : "s"} of this creative
            </span>
          </p>
        )}

        <p className="mt-3 text-sm">
          {service.price_mwk != null ? (
            <>
              <span className="text-ink/55">From </span>
              <span className="font-semibold text-ink">{formatMwk(service.price_mwk)}</span>
              {service.price_mwk_max && (
                <span className="text-ink/65"> – {formatMwk(service.price_mwk_max)}</span>
              )}
            </>
          ) : (
            <span className="text-ink/65">Price on request</span>
          )}
          {service.delivery_days && <span className="text-ink/55"> · ~{service.delivery_days}d</span>}
        </p>
      </div>
    </div>
  );
}
