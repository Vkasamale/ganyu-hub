/**
 * A rate-card entry on a creative's profile: cover, title, the creative's
 * rating, and "From MWK X".
 *
 * @startingPoint section="Listings" subtitle="Rate-card service tile on paper" viewport="700x280"
 */
export interface ServiceCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string | null;
  /** The LOW end of the span. Null renders "Price on request". */
  priceMwk?: number | null;
  priceMaxMwk?: number | null;
  deliveryDays?: number | null;
  /** Newest portfolio piece — there is no per-service image. Null omits the cover. */
  coverUrl?: string | null;
  /** The CREATIVE'S rating, labelled as such. Null below the first review. */
  rating?: { avg: number; count: number } | null;
}
export function ServiceCard(props: ServiceCardProps): JSX.Element;
