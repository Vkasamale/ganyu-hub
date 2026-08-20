/**
 * A creative, as a listing card. Used on browse, the signed-in home rails, and
 * search results.
 *
 * @startingPoint section="Listings" subtitle="Creative listing card, with and without a cover" viewport="700x420"
 */
export interface CreativeCardProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  location?: string;
  headline?: string;
  /** Primary category — renders as a paper pill over the cover. */
  category?: string;
  /** Cover photo. Null falls back to teal-gradient initials, never a grey silhouette. */
  avatarUrl?: string | null;
  /** First three render as chips; the rest collapse to "+N". */
  skills?: string[];
  availability?: "available" | "busy" | "away";
  /** Null below the first review. Never pass 0. */
  rating?: number | null;
  reviewCount?: number;
  /** Low end of the rate card. Null renders "Custom pricing". */
  fromPriceMwk?: number | null;
  showSave?: boolean;
  saved?: boolean;
  /** Accepted and IGNORED — the shipped card shows no verification badge. Kept
   *  so a profile object can be spread in without leaking onto the DOM. */
  verifiedAt?: string | null;
}
export function CreativeCard(props: CreativeCardProps): JSX.Element;
