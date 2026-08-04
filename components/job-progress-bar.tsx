import { STAGES, type JobStageResult } from "@/lib/job-stages";

// Horizontal stepper. Completed = filled + check. Current = ring. Remaining = grey.
// Overlay (cancelled / disputed) renders as a colored marker on the stage where
// it happened, with a label underneath.
export function JobProgressBar({ stage }: { stage: JobStageResult }) {
  const { currentIdx, overlay } = stage;
  const overlayColor = overlay?.kind === "cancelled" ? "bg-red-600" : "bg-amber-500";
  const overlayLabel = overlay?.kind === "cancelled" ? "Cancelled here" : "Disputed here";
  const jobDead = overlay?.kind === "cancelled";

  return (
    <div className="w-full overflow-x-auto">
      <ol className="flex min-w-[520px] items-start justify-between gap-2 px-1 sm:min-w-0" aria-label="Job progress">
        {STAGES.map((s, i) => {
          const done = !jobDead && i < currentIdx;
          const current = !jobDead && i === currentIdx;
          const showOverlay = overlay?.stageIdx === i;

          const dotBase = "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold";
          const dotClass = showOverlay
            ? `${dotBase} ${overlayColor} border-transparent text-white`
            : done
              ? `${dotBase} bg-emerald-600 border-emerald-600 text-white`
              : current
                ? `${dotBase} bg-white border-ink text-ink ring-4 ring-ink/10`
                : `${dotBase} bg-neutral-100 border-neutral-300 text-neutral-400`;

          return (
            <li key={s.key} className="flex flex-1 flex-col items-center gap-1.5 text-center">
              <div className="flex w-full items-center">
                {i > 0 && (
                  <div className={`h-0.5 flex-1 ${!jobDead && i <= currentIdx ? "bg-emerald-500" : "bg-neutral-200"}`} />
                )}
                <div className={dotClass} aria-current={current ? "step" : undefined}>
                  {showOverlay ? "!" : done ? "✓" : i + 1}
                </div>
                {i < STAGES.length - 1 && (
                  <div className={`h-0.5 flex-1 ${!jobDead && i < currentIdx ? "bg-emerald-500" : "bg-neutral-200"}`} />
                )}
              </div>
              <div className={`text-[11px] leading-tight sm:text-xs ${showOverlay ? "font-semibold text-ink" : current ? "font-semibold text-ink" : done ? "text-ink/70" : "text-neutral-400"}`}>
                {s.label}
                {showOverlay && (
                  <div className={`mt-0.5 text-[10px] font-semibold uppercase tracking-wide ${overlay?.kind === "cancelled" ? "text-red-700" : "text-amber-700"}`}>
                    {overlayLabel}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
