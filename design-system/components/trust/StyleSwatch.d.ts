/**
 * Visual style vocabulary — six drawn swatches so a client can point instead
 * of naming a style they have no word for.
 *
 * @startingPoint section="Trust" subtitle="Six style swatches and the picker" viewport="700x180"
 */
export interface StyleSwatchProps extends React.SVGAttributes<SVGSVGElement> {
  /** One of: flat · 3d · hand-drawn · vintage · photographic · bold-type. */
  slug: string;
}
export function StyleSwatch(props: StyleSwatchProps): JSX.Element;

export interface StyleChoicesProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Checkbox name — submits with `getAll(name)`. */
  name: string;
  selected?: string[];
}
export function StyleChoices(props: StyleChoicesProps): JSX.Element;
export const STYLES: { slug: string; label: string; hint: string }[];
