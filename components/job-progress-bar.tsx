"use client";

import { useEffect, useState } from "react";
import { STAGES, type JobStageResult } from "@/lib/job-stages";

// The five stage colours, from design-system/tokens/colors.css (--stage-1..5).
// These are the design system's own values, not an invention: sky, indigo,
// violet, amber, emerald. On 2026-08-22 this was flattened to a single teal by
// a session that had read design-system/CLAUDE.md — a 212-line summary — and
// assumed it was the whole system. The tokens were in the repo the entire time.
//
// They are NOT the money-state inks and must never be swapped for them: the
// money inks say what a job's money is doing, these say how far along the job
// itself is.
const STAGE_COLORS = [
  { bg: "bg-stage-1", ring: "ring-stage-1/25", text: "text-stage-1", bar: "bg-stage-1" },
  { bg: "bg-stage-2", ring: "ring-stage-2/25", text: "text-stage-2", bar: "bg-stage-2" },
  { bg: "bg-stage-3", ring: "ring-stage-3/25", text: "text-stage-3", bar: "bg-stage-3" },
  { bg: "bg-stage-4", ring: "ring-stage-4/25", text: "text-stage-4", bar: "bg-stage-4" },
  { bg: "bg-stage-5", ring: "ring-stage-5/25", text: "text-stage-5", bar: "bg-stage-5" },
];

export function JobProgressBar({ stage }: { stage: JobStageResult }) {
  const { currentIdx, overlay } = stage;
  const jobDead = overlay?.kind === "cancelled";
  // --stage-cancelled for a cancelled job; a dispute is a money state and takes
  // that state's ink.
  const overlayColor = overlay?.kind === "cancelled" ? "bg-stage-cancelled" : "bg-money-disputed";
  const overlayLabel = overlay?.kind === "cancelled" ? "Cancelled here" : "Disputed here";

  // Grow-in on mount, matching the recharts default animation feel.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  return (
    <div className="w-full overflow-x-auto py-2">
      <ol className="flex min-w-[520px] items-start justify-between gap-2 px-2 sm:min-w-0" aria-label="Job progress">
        {STAGES.map((s, i) => {
          const done = !jobDead && i < currentIdx;
          const current = !jobDead && i === currentIdx;
          const showOverlay = overlay?.stageIdx === i;
          const color = STAGE_COLORS[i];

          const dotBase = "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-all duration-500";
          const dotClass = showOverlay
            ? `${dotBase} ${overlayColor} border-transparent text-white`
            : done
              ? `${dotBase} ${color.bg} border-transparent text-white`
              : current
                ? `${dotBase} ${color.bg} border-transparent text-white ring-4 ${color.ring} scale-110`
                : `${dotBase} bg-band border-ink/15 text-ink/45`;

          const leftFilled = !jobDead && mounted && i <= currentIdx;
          const rightFilled = !jobDead && mounted && i < currentIdx;
          const leftColor = STAGE_COLORS[i - 1]?.bar ?? color.bar;
          const rightColor = color.bar;
          const delay = `${i * 180}ms`;

          // Completed: check only. Current: nothing (ring signals it). Otherwise: number.
          const dotContent = showOverlay ? "!" : done ? "✓" : current ? "" : i + 1;

          return (
            <li key={s.key} className="flex flex-1 flex-col items-center gap-1.5 text-center">
              <div className="flex w-full items-center">
                {i > 0 && (
                  <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-grey">
                    <div
                      className={`h-full ${leftColor} transition-all duration-700 ease-out`}
                      style={{ width: leftFilled ? "100%" : "0%", transitionDelay: delay }}
                    />
                  </div>
                )}
                <div className={dotClass} style={{ transitionDelay: delay }} aria-current={current ? "step" : undefined}>
                  {dotContent}
                </div>
                {i < STAGES.length - 1 && (
                  <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-grey">
                    <div
                      className={`h-full ${rightColor} transition-all duration-700 ease-out`}
                      style={{ width: rightFilled ? "100%" : "0%", transitionDelay: delay }}
                    />
                  </div>
                )}
              </div>
              <div className={`text-[11px] leading-tight sm:text-xs ${showOverlay ? "font-semibold text-ink" : current ? `font-semibold ${color.text}` : done ? "text-ink/70" : "text-ink/45"}`}>
                {s.label}
                {showOverlay && (
                  <div className={`mt-0.5 text-[10px] font-semibold uppercase tracking-wide ${overlay?.kind === "cancelled" ? "text-stage-cancelled" : "text-money-disputed"}`}>
                    {overlayLabel}
                  </div>
                )}
              </div>
              <div className="mt-0.5 text-[10px] font-mono tabular-nums text-ink/45">{i + 1}</div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
