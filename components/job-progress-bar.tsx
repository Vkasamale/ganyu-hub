"use client";

import { useEffect, useState } from "react";
import { STAGES, type JobStageResult } from "@/lib/job-stages";

// One accent, not five. This bar used to run sky - indigo - violet - amber -
// emerald, which invented a colour per stage and made a job look like it was
// changing category as it progressed. Teal is the system's only chromatic
// accent, and progress is one idea: done, here, not yet. The stage number
// under each dot already tells them apart.
//
// Deliberately NOT the money-state inks: those five colours name what a job's
// money is doing, and four of these five stages are not money events.
const STAGE_COLORS = Array.from({ length: 5 }, () => ({
  bg: "bg-stamp",
  ring: "ring-stamp/25",
  text: "text-stamp-dark",
  bar: "bg-stamp",
}));

export function JobProgressBar({ stage }: { stage: JobStageResult }) {
  const { currentIdx, overlay } = stage;
  const jobDead = overlay?.kind === "cancelled";
  // A dispute IS a money state, so it takes that state's ink. A cancellation
  // is not — the money went back — so it reads as ink rather than as a sixth
  // money colour.
  const overlayColor = overlay?.kind === "cancelled" ? "bg-ink/70" : "bg-money-disputed";
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
                  <div className={`mt-0.5 text-[10px] font-semibold uppercase tracking-wide ${overlay?.kind === "cancelled" ? "text-ink/70" : "text-money-disputed"}`}>
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
