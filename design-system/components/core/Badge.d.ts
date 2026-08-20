import * as React from "react";

/**
 * Pill label. Read-only — a badge is never clickable.
 *
 * @startingPoint section="Core" subtitle="Neutral, chip, wash, mark and teal pills" viewport="700x120"
 */
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** `neutral` default · `chip` (ink 5%, skill tags) · `wash` (category on a card) · `mark` (reserved green: budget, verified) · `teal`. */
  tone?: "neutral" | "chip" | "wash" | "mark" | "teal";
}
export function Badge(props: BadgeProps): JSX.Element;
