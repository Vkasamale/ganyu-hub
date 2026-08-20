/**
 * Read-only five-star rating. Amber-400 is the only star colour in the product.
 *
 * @startingPoint section="Trust" subtitle="Read-only rating, amber-400" viewport="700x110"
 */
export interface StarsProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** 0–5. Rounded to whole stars for the fill. */
  value?: number;
  /** Pixel box per star. 14 in card meta rows, 16 default. */
  size?: number;
}
export function Stars(props: StarsProps): JSX.Element;
