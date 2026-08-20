/** Interactive five-star input. 28px stars — a rating tap must not miss. */
export interface StarRatingInputProps {
  /** Name of the hidden input carrying the value. */
  name: string;
  defaultValue?: number;
  onChange?: (value: number) => void;
}
export function StarRatingInput(props: StarRatingInputProps): JSX.Element;
