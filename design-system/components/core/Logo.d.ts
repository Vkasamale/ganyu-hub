import * as React from "react";

/**
 * The Ganyu Hub lockup: the stamp mark plus "Ganyu Hub" in Inter at 600.
 *
 * @startingPoint section="Brand" subtitle="Mark plus wordmark in three sizes" viewport="700x140"
 */
export interface LogoProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** sm 25px · md 32px · lg 41px mark. */
  size?: "sm" | "md" | "lg";
  /** Path to the mark PNG, relative to the consuming page. */
  markSrc?: string;
  /** Set false for the mark alone (favicon slots, tight mobile headers). */
  wordmark?: boolean;
}
export function Logo(props: LogoProps): JSX.Element;
