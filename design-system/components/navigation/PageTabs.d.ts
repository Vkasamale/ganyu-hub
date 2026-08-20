/**
 * Sub-tabs under a page title — teal underline, never filled pills.
 *
 * @startingPoint section="Navigation" subtitle="Underlined page tabs with optional counts" viewport="700x100"
 */
export interface PageTab {
  key: string;
  label: string;
  href?: string;
  /** Omitted when 0 or null — never render a "0" count. */
  count?: number | null;
}
export interface PageTabsProps extends React.HTMLAttributes<HTMLElement> {
  tabs?: PageTab[];
  active: string;
  onSelect?: (key: string) => void;
}
export function PageTabs(props: PageTabsProps): JSX.Element;
