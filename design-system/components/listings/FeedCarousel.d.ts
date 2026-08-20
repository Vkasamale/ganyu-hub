/**
 * The horizontal rail used by every row on the signed-in home.
 *
 * @startingPoint section="Listings" subtitle="Peeking scroll-snap rail with See all" viewport="700x400"
 */
export interface FeedCarouselProps extends React.HTMLAttributes<HTMLElement> {
  title: string;
  /** Plex Mono uppercase kicker above the heading. */
  eyebrow?: string;
  seeAllHref?: string;
  seeAllLabel?: string;
  /** Replaces the "See all" link — e.g. a "Clear all" form. */
  action?: React.ReactNode;
  /** How many items `children` holds. Zero renders NOTHING — never an empty rail under a heading. */
  count?: number;
}
export function FeedCarousel(props: FeedCarouselProps): JSX.Element | null;
export function FeedCard(props: React.LiHTMLAttributes<HTMLLIElement>): JSX.Element;
