/**
 * An empty state that says what to do next, not just that something is absent.
 * The `prompt` weight carries the "nothing yet" stamp — its own artwork, never
 * one of the five money stamps.
 *
 * @startingPoint section="Trust" subtitle="Prompt and quiet empty states" viewport="700x420"
 */
export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  body?: string;
  actionLabel?: string;
  actionHref?: string;
  /** `prompt` — dashed panel, the stamp, a real button, for a whole empty surface. `quiet` — a line of text, for one empty region on a full page. */
  tone?: "prompt" | "quiet";
}
export function EmptyState(props: EmptyStateProps): JSX.Element;
