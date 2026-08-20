/**
 * Lucide icon wrapper. Requires the Lucide UMD build on the page.
 * The product's icon set is lucide-react at 1.5–2px stroke; nothing else.
 */
export interface IconProps extends React.SVGAttributes<SVGSVGElement> {
  /** Lucide PascalCase name, e.g. `Home`, `Wallet`, `BadgeCheck`. */
  name: string;
  /** Pixel box. 14 (inline meta) · 18 (drawer) · 20 (tab bar) · 24 (feature). */
  size?: number;
  /** 1.5 for decorative/large, 2 for UI. Never heavier. */
  strokeWidth?: number;
  color?: string;
}
export function Icon(props: IconProps): JSX.Element;
