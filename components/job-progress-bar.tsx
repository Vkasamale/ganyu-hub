"use client";

import { useEffect, useState } from "react";
import { STAGES, type JobStageResult } from "@/lib/job-stages";

// Per-stage colors. Each dot reads distinctly; completed connectors match the
// color of the stage they lead into.
const STAGE_COLORS = [
  { bg: "bg-sky-500",     ring: "ring-sky-200",     text: "text-sky-700",     bar: "bg-sky-500" },
  { bg: "bg-indigo-500",  ring: "ring-indigo-200",  text: "text-indigo-700",  bar: "bg-indigo-500" },
  { bg: "bg-violet-500",  ring: "ring-violet-200",  text: "text-violet-700",  bar: "bg-violet-500" },
  { bg: "bg-amber-500",   ring: "ring-amber-200",   text: "text-amber-700",   bar: "bg-amber-500" },
  { bg: "bg-emerald-600", ring: "ring-emerald-200", text: "text-emerald-700", bar: "bg-emerald-600" },
];

export function JobProgressBar({ stage }: { stage: JobStageResult }) {
  const { currentIdx, overlay } = stage;
  const jobDead = overlay?.kind === "cancelled";
  const overlayColor = overlay?.kind === "cancelled" ? "bg-red-600" : "bg-amber-500";
  const overlayLabel = overlay?.kind === "cancelled" ? "Cancelled here" : "Disputed here";

  // Grow-in on mount, matching the recharts default animation feel.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  return (
    <div className="w-full overflow-x-auto">
      <ol className="flex min-w-[520px] items-start justify-between gap-2 px-1 sm:min-w-0" aria-label="Job progress">
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
                : `${dotBase} bg-neutral-100 border-neutral-300 text-neutral-400`;

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
                  <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-neutral-200">
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
                  <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-neutral-200">
                    <div
                      className={`h-full ${rightColor} transition-all duration-700 ease-out`}
                      style={{ width: rightFilled ? "100%" : "0%", transitionDelay: delay }}
                    />
                  </div>
                )}
              </div>
              <div className={`text-[11px] leading-tight sm:text-xs ${showOverlay ? "font-semibold text-ink" : current ? `font-semibold ${color.text}` : done ? "text-ink/70" : "text-neutral-400"}`}>
                {s.label}
                {showOverlay && (
                  <div className={`mt-0.5 text-[10px] font-semibold uppercase tracking-wide ${overlay?.kind === "cancelled" ? "text-red-700" : "text-amber-700"}`}>
                    {overlayLabel}
                  </div>
                )}
              </div>
              <div className="mt-0.5 text-[10px] font-mono tabular-nums text-neutral-400">{i + 1}</div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
