/**
 * The verification mark. Reserved green, careful wording, no negative state.
 *
 * @startingPoint section="Trust" subtitle="Checked by Ganyu Hub, two sizes" viewport="700x110"
 */
export interface VerifiedBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** ISO timestamp, or null/undefined. Null renders nothing at all. */
  verifiedAt: string | null | undefined;
  size?: "sm" | "lg";
}
export function VerifiedBadge(props: VerifiedBadgeProps): JSX.Element | null;
