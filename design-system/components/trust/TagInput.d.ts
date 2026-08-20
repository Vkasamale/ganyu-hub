/** Chip input for skills and tags. Submits one hidden input per tag under `name`. */
export interface TagInputProps {
  name: string;
  defaultValue?: string[];
  placeholder?: string;
}
export function TagInput(props: TagInputProps): JSX.Element;
