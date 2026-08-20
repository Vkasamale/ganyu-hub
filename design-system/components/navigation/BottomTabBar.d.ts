/**
 * The mobile shell: four destinations plus Menu, safe-area padded, backdrop
 * blurred paper. Hidden from md up — the desktop shell is PrimaryNav.
 *
 * @startingPoint section="Navigation" subtitle="Mobile tab bar and the grouped drawer" viewport="390x120"
 */
export interface BottomTabBarProps extends React.HTMLAttributes<HTMLElement> {
  /** Four destinations. Use CLIENT_TABS or CREATIVE_TABS — role changes wording, never capability. */
  tabs?: { href: string; label: string; icon: string }[];
  /** href of the current destination. */
  active?: string;
  /** Unread badge on Messages. Zero hides it. Caps at "9+". */
  unreadCount?: number;
  onNavigate?: (href: string) => void;
  onMenu?: () => void;
  /** `fixed` in a real viewport; `absolute` inside a phone frame. */
  position?: "fixed" | "absolute";
}
export function BottomTabBar(props: BottomTabBarProps): JSX.Element;

export interface NavDrawerProps extends React.HTMLAttributes<HTMLDivElement> {
  groups?: { title: string; items: { href: string; label: string; icon: string }[] }[];
  version?: string;
  onClose?: () => void;
  onNavigate?: (href: string) => void;
}
export function NavDrawer(props: NavDrawerProps): JSX.Element;
export const CLIENT_TABS: { href: string; label: string; icon: string }[];
export const CREATIVE_TABS: { href: string; label: string; icon: string }[];
