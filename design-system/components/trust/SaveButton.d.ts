/** The save heart on listing cards. 32px circle, top-right, above the card link. */
export interface SaveButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  saved?: boolean;
  onToggle?: (saved: boolean) => void;
}
export function SaveButton(props: SaveButtonProps): JSX.Element;
