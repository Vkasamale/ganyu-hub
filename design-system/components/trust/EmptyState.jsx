import React from "react";
import { Button } from "../core/Button.jsx";
import { stampUrl } from "../money/MoneyStamp.jsx";

/**
 * Two weights on purpose. `prompt`: a whole surface with nothing in it, so it
 * gets a panel, the "nothing yet" stamp and a real way out. `quiet`: one empty
 * region on a page that is otherwise full — a line of text and at most a link,
 * never the stamp.
 *
 * The stamp here is its own artwork (`nothing-yet`). The five money stamps are
 * never borrowed for an empty state: they name stages of a job's money, and
 * nothing has happened here yet.
 */
export function EmptyState({ title, body, actionLabel, actionHref = "#", tone = "prompt", style, ...rest }) {
  if (tone === "quiet") {
    return (
      <div {...rest} style={{ padding: "32px 24px", textAlign: "center", ...style }}>
        <p style={{ margin: 0, fontSize: "var(--text-sm)", color: "var(--gh-ink-60)" }}>{title}</p>
        {body && <p style={{ margin: "4px 0 0", fontSize: "var(--text-xs)", color: "var(--gh-ink-45)" }}>{body}</p>}
        {actionLabel && (
          <a href={actionHref} style={{ display: "inline-block", marginTop: 8, fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--gh-teal-dark)" }}>
            {actionLabel}
          </a>
        )}
      </div>
    );
  }
  return (
    <div
      {...rest}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
        borderRadius: "var(--radius-card)", border: "2px dashed var(--surface-accent-edge)",
        background: "var(--surface-accent)", padding: "48px 24px 56px", ...style,
      }}
    >
      <img
        src={stampUrl("nothing-yet")}
        alt=""
        width={112}
        height={112}
        loading="lazy"
        decoding="async"
        style={{ display: "block", width: 112, height: 112, marginBottom: 12, userSelect: "none" }}
      />
      <p style={{ margin: 0, fontSize: "var(--text-base)", fontWeight: "var(--weight-semibold)", color: "var(--gh-ink)" }}>{title}</p>
      {body && <p style={{ margin: "4px 0 0", maxWidth: 384, fontSize: "var(--text-sm)", color: "var(--gh-ink-60)", textWrap: "pretty" }}>{body}</p>}
      {actionLabel && (
        <a href={actionHref} style={{ marginTop: 20 }}>
          <Button variant="outline">{actionLabel}</Button>
        </a>
      )}
    </div>
  );
}
