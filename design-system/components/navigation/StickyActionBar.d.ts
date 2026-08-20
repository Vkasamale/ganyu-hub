/**
 * Mobile-only pinned action bar for long detail pages. Renders a LINK to the
 * real action, never a duplicate submit.
 *
 * @startingPoint section="Navigation" subtitle="Pinned mobile action bar with amount hint" viewport="390x100"
 */
export interface StickyActionBarProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  /** Left-hand context, usually the amount. Truncates. */
  hint?: string;
  href?: string;
  /** `fixed` in a real viewport; `absolute` inside a phone frame. */
  position?: "fixed" | "absolute";
}
export function StickyActionBar(props: StickyActionBarProps): JSX.Element;
