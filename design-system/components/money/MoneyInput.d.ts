/** MWK amount field. Formats thousands while typing; submits plain digits under `name`. */
export interface MoneyInputProps {
  /** Name on the hidden input carrying the raw number. */
  name: string;
  defaultValue?: number | null;
  placeholder?: string;
  required?: boolean;
  /** Fires with the raw digit string — for live previews (the job wizard uses it). */
  onValueChange?: (raw: string) => void;
}
export function MoneyInput(props: MoneyInputProps): JSX.Element;
