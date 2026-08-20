/**
 * The five-stage job tracker: Posted → Creative hired → Money in escrow →
 * Work delivered → Money released. Each stage owns a colour.
 *
 * @startingPoint section="Money" subtitle="Five-stage escrow tracker with dispute overlay" viewport="700x160"
 */
export interface JobProgressBarProps {
  /** Index of the stage in progress (0-4). Earlier stages render as done. */
  currentIdx?: number;
  /** Marks one stage as gone wrong. `cancelled` kills the whole bar. */
  overlay?: { stageIdx: number; kind: "cancelled" | "disputed" } | null;
}
export function JobProgressBar(props: JobProgressBarProps): JSX.Element;
export const STAGES: { key: string; label: string }[];
