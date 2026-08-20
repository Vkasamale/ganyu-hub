import React from "react";

export const STAGES = [
  { key: "posted", label: "Posted" },
  { key: "hired", label: "Creative hired" },
  { key: "funded", label: "Money in escrow" },
  { key: "delivered", label: "Work delivered" },
  { key: "released", label: "Money released" },
];

const COLORS = [
  { dot: "var(--stage-1)", ring: "rgba(14,165,233,0.25)", text: "#0369a1" },
  { dot: "var(--stage-2)", ring: "rgba(99,102,241,0.25)", text: "#4338ca" },
  { dot: "var(--stage-3)", ring: "rgba(139,92,246,0.25)", text: "#6d28d9" },
  { dot: "var(--stage-4)", ring: "rgba(245,158,11,0.25)", text: "#b45309" },
  { dot: "var(--stage-5)", ring: "rgba(5,150,105,0.25)", text: "#047857" },
];

/** Five stages, in order, each its own colour. Connectors fill on mount. */
export function JobProgressBar({ currentIdx = 0, overlay = null, style, ...rest }) {
  const [mounted, setMounted] = React.useState(false);
  // min-w-[520px] sm:min-w-0 — the floor keeps the five stages legible on a
  // phone (the row scrolls), then drops away so the tracker fits its container.
  const [wide, setWide] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const sync = () => setWide(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  React.useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);
  const dead = overlay && overlay.kind === "cancelled";
  const overlayColor = dead ? "var(--stage-cancelled)" : "var(--stage-4)";
  const overlayLabel = dead ? "Cancelled here" : "Disputed here";

  const connector = (filled, color, delay) => (
    <div style={{ position: "relative", height: 4, flex: 1, overflow: "hidden", borderRadius: 999, background: "#e5e5e5" }}>
      <div style={{ height: "100%", background: color, width: filled ? "100%" : "0%", transition: "width var(--dur-progress) var(--ease-out)", transitionDelay: delay }} />
    </div>
  );

  return (
    <div style={{ width: "100%", overflowX: "auto", padding: "8px 0", ...style }} {...rest}>
      <ol aria-label="Job progress" style={{ display: "flex", minWidth: wide ? 0 : 520, alignItems: "flex-start", justifyContent: "space-between", gap: 8, padding: "0 8px", margin: 0, listStyle: "none" }}>
        {STAGES.map((s, i) => {
          const done = !dead && i < currentIdx;
          const current = !dead && i === currentIdx;
          const isOverlay = overlay && overlay.stageIdx === i;
          const c = COLORS[i];
          const delay = i * 180 + "ms";
          const fill = isOverlay ? overlayColor : done || current ? c.dot : "#f5f5f5";
          return (
            <li key={s.key} style={{ display: "flex", flex: 1, flexDirection: "column", alignItems: "center", gap: 6, textAlign: "center" }}>
              <div style={{ display: "flex", width: "100%", alignItems: "center" }}>
                {i > 0 && connector(!dead && mounted && i <= currentIdx, (COLORS[i - 1] || c).dot, delay)}
                <div
                  aria-current={current ? "step" : undefined}
                  style={{
                    display: "flex", height: 32, width: 32, flexShrink: 0, alignItems: "center", justifyContent: "center",
                    borderRadius: "var(--radius-pill)",
                    border: "2px solid " + (done || current || isOverlay ? "transparent" : "var(--stage-idle-border)"),
                    background: fill,
                    color: done || current || isOverlay ? "#fff" : "var(--stage-idle-text)",
                    fontSize: "var(--text-xs)", fontWeight: "var(--weight-semibold)",
                    boxShadow: current ? "0 0 0 4px " + c.ring : "none",
                    transform: current ? "scale(1.1)" : "none",
                    transition: "all 500ms var(--ease-out)", transitionDelay: delay,
                  }}
                >
                  {isOverlay ? "!" : done ? "\u2713" : current ? "" : i + 1}
                </div>
                {i < STAGES.length - 1 && connector(!dead && mounted && i < currentIdx, c.dot, delay)}
              </div>
              <div style={{ fontSize: "var(--text-11)", lineHeight: "var(--leading-tight)", fontWeight: current || isOverlay ? "var(--weight-semibold)" : 400, color: isOverlay ? "var(--gh-ink)" : current ? c.text : done ? "var(--gh-ink-70)" : "var(--stage-idle-text)" }}>
                {s.label}
                {isOverlay && (
                  <div style={{ marginTop: 2, fontSize: "var(--text-10)", fontWeight: "var(--weight-semibold)", textTransform: "uppercase", letterSpacing: "0.05em", color: dead ? "#b91c1c" : "#b45309" }}>
                    {overlayLabel}
                  </div>
                )}
              </div>
              <div style={{ marginTop: 2, fontFamily: "var(--font-mono)", fontSize: "var(--text-10)", fontVariantNumeric: "tabular-nums", color: "var(--stage-idle-text)" }}>{i + 1}</div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
