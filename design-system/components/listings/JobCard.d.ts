/**
 * A posted job, as a listing card. Used on /jobs, saved lists and home rails.
 *
 * @startingPoint section="Listings" subtitle="Job card with budget pill and client trust signals" viewport="700x420"
 */
export interface JobCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  category: string;
  /** Relative time string, e.g. "2 days ago". */
  postedAgo?: string;
  clientName?: string;
  brief?: string;
  /** Null renders "Budget: Open" — never a fabricated figure. */
  budgetMwk?: number | null;
  /** Short client-trust phrases. Omit a signal rather than showing a zero. */
  trustBits?: string[];
  proposalsCount?: number;
  showSave?: boolean;
  saved?: boolean;
}
export function JobCard(props: JobCardProps): JSX.Element;
