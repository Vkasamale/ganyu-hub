import React from "react";

/** Chip input: type, Enter or comma commits, Backspace on empty removes the last. */
export function TagInput({ name, defaultValue = [], placeholder, style, ...rest }) {
  const [tags, setTags] = React.useState(defaultValue);
  const [draft, setDraft] = React.useState("");
  const [focus, setFocus] = React.useState(false);

  function add(input) {
    const v = String(input).trim().replace(/,+$/, "").trim();
    if (!v) return;
    if (tags.some((t) => t.toLowerCase() === v.toLowerCase())) { setDraft(""); return; }
    setTags(tags.concat([v]));
    setDraft("");
  }

  return (
    <div {...rest} style={style}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, borderRadius: "var(--radius-control)", border: "1px solid var(--border-control)", background: "var(--gh-white)", padding: 6, outline: focus ? "2px solid var(--focus-ring)" : "none" }}>
        {tags.map((t, i) => (
          <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 4, borderRadius: "var(--radius-pill)", border: "1px solid var(--gh-teal)", background: "var(--gh-teal)", padding: "4px 12px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--gh-ground)" }}>
            {t}
            <button type="button" onClick={() => setTags(tags.filter((_, idx) => idx !== i))} aria-label={"Remove " + t} style={{ border: 0, background: "none", padding: 0, cursor: "pointer", lineHeight: 1, color: "rgba(239,230,206,0.8)" }}>
              &times;
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onFocus={() => setFocus(true)}
          onBlur={() => { setFocus(false); add(draft); }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(draft); }
            else if (e.key === "Backspace" && !draft && tags.length) { setTags(tags.slice(0, -1)); }
          }}
          placeholder={tags.length ? "" : placeholder}
          style={{ minWidth: "8rem", flex: 1, background: "transparent", border: 0, padding: "4px", fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--gh-ink)", outline: "none" }}
        />
      </div>
      {tags.map((t) => <input key={"h-" + t} type="hidden" name={name} value={t} />)}
      <p style={{ margin: "4px 0 0", fontSize: "var(--text-11)", color: "#737373" }}>Type and press Enter to add each one.</p>
    </div>
  );
}
