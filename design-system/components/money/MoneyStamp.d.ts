/**
 * The money-state stamp — Ganyu Hub's signature device. Sits on the money
 * figure's line, at the card's right margin, larger than a badge.
 *
 * Supplied artwork from `assets/stamps/`, one file per state. Never substitute a
 * chip, badge, or coded imitation.
 *
 * @startingPoint section="Money" subtitle="The five stages of a job's money, as pressed stamps" viewport="700x260"
 */
export interface MoneyStampProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** The escrow status. Five states, five inks — never collapse to grey. */
  state?: "none" | "payment_pending" | "payment_held" | "payment_released" | "payment_disputed";
  /**
   * Retitles the image for screen readers and tooltips. The visible wording is
   * part of the artwork and cannot be changed here.
   */
  label?: string;
  /** `sm` in dense rows, `md` on mobile, `lg` from md up. */
  size?: "sm" | "md" | "lg";
  /**
   * Folder holding the stamp PNGs. Defaults to a path derived from the design
   * system bundle's own `src`, which is correct in almost every case — set it
   * only when the assets are served from somewhere else.
   */
  basePath?: string;
}
export function MoneyStamp(props: MoneyStampProps): JSX.Element;
export const MONEY_STATES: Record<string, { label: string; slug: string; ink: string }>;
