import * as React from "react";

/**
 * The Ganyu Hub button. Teal is the only filled variant — one primary action
 * per view, everything else outline or ghost.
 *
 * @startingPoint section="Core" subtitle="Teal default, outline, ghost and link, in three heights" viewport="700x180"
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** `default` = teal fill. `outline` on white. `ghost` for toolbars. `link` for inline. */
  variant?: "default" | "outline" | "ghost" | "link";
  /** sm 36px · default 40px · lg 44px (the touch minimum). */
  size?: "sm" | "default" | "lg";
  disabled?: boolean;
}
export function Button(props: ButtonProps): JSX.Element;
