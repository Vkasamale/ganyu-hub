/**
 * The desktop header nav — three verb-phrased destinations.
 *
 * @startingPoint section="Navigation" subtitle="Verb-based desktop nav, client and creative" viewport="700x120"
 */
export interface PrimaryNavProps extends React.HTMLAttributes<HTMLElement> {
  /** Three destinations. Use CLIENT_NAV or CREATIVE_NAV. */
  items?: { href: string; label: string }[];
  active?: string;
  onNavigate?: (href: string) => void;
}
export function PrimaryNav(props: PrimaryNavProps): JSX.Element;
export const CLIENT_NAV: { href: string; label: string }[];
export const CREATIVE_NAV: { href: string; label: string }[];
