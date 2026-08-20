import React from "react";
import { Icon } from "../core/Icon.jsx";

/**
 * The mobile shell. Four destinations plus Menu — and NO create action in the
 * bar: a "+" between two tabs is the button people hit by accident, and posting
 * a job is a deliberate act that deserves a deliberate button.
 *
 * The app is installable, so in standalone mode there is no browser back
 * button. The drawer is grouped (Your work / Settings / Help) with the version
 * at the foot, because thirteen flat rows is a list you scan once and give up
 * on.
 */
export const CLIENT_TABS = [
  { href: "/", label: "Home", icon: "Home" },
  { href: "/browse", label: "Find someone", icon: "Search" },
  { href: "/messages", label: "Messages", icon: "MessageSquare" },
  { href: "/dashboard/jobs", label: "My work", icon: "Briefcase" },
];

export const CREATIVE_TABS = [
  { href: "/", label: "Home", icon: "Home" },
  { href: "/jobs", label: "Find work", icon: "Search" },
  { href: "/messages", label: "Messages", icon: "MessageSquare" },
  { href: "/dashboard/jobs", label: "My work", icon: "Briefcase" },
];

export function BottomTabBar({ tabs = CREATIVE_TABS, active = "/", unreadCount = 0, onNavigate, onMenu, position = "fixed", style, ...rest }) {
  const cell = (on) => ({
    position: "relative", display: "flex", width: "100%", flexDirection: "column", alignItems: "center", gap: 2,
    padding: "8px 4px", minHeight: 44, border: 0, background: "none", cursor: "pointer",
    fontFamily: "var(--font-body)", fontSize: "var(--text-10)", fontWeight: "var(--weight-medium)",
    color: on ? "var(--gh-teal-dark)" : "var(--gh-ink-55)", textDecoration: "none",
  });
  return (
    <nav
      {...rest}
      aria-label="Main"
      style={{
        position, insetInline: 0, bottom: 0, zIndex: 40,
        borderTop: "1px solid var(--gh-ink-10)",
        background: "var(--surface-bar)", backdropFilter: "blur(8px)",
        boxShadow: "var(--elev-2)",
        paddingBottom: "env(safe-area-inset-bottom)",
        ...style,
      }}
    >
      <ul style={{ display: "flex", alignItems: "stretch", margin: 0, padding: 0, listStyle: "none" }}>
        {tabs.map((t) => {
          const on = active === t.href;
          return (
            <li key={t.href} style={{ flex: 1 }}>
              <a href={t.href} aria-current={on ? "page" : undefined} onClick={(e) => { if (onNavigate) { e.preventDefault(); onNavigate(t.href); } }} style={cell(on)}>
                <Icon name={t.icon} size={20} />
                {t.href === "/messages" && unreadCount > 0 && (
                  <span style={{ position: "absolute", right: "22%", top: 4, minWidth: 16, borderRadius: "var(--radius-pill)", background: "var(--gh-teal)", padding: "0 4px", fontSize: "var(--text-9)", fontWeight: "var(--weight-bold)", lineHeight: "16px", color: "var(--gh-ground)", textAlign: "center" }}>
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.label}</span>
              </a>
            </li>
          );
        })}
        <li style={{ flex: 1 }}>
          <button type="button" onClick={onMenu} aria-haspopup="menu" style={cell(false)}>
            <Icon name="Menu" size={20} />
            <span>Menu</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}

/** The grouped drawer the Menu tab opens. Paper sheet, shadow pointing up. */
export function NavDrawer({ groups = [], version = "1.0.0", onClose, onNavigate, style, ...rest }) {
  return (
    <div {...rest} style={{ position: "absolute", inset: 0, zIndex: 50, ...style }}>
      <button type="button" aria-label="Close menu" onClick={onClose} style={{ position: "absolute", inset: 0, border: 0, background: "var(--surface-scrim)", cursor: "pointer" }} />
      <div style={{ position: "absolute", insetInline: 0, bottom: 0, maxHeight: "85%", overflowY: "auto", borderTopLeftRadius: "var(--radius-card-lg)", borderTopRightRadius: "var(--radius-card-lg)", background: "var(--surface-sheet)", paddingBottom: "calc(env(safe-area-inset-bottom) + 16px)", boxShadow: "var(--shadow-sheet)" }}>
        <div style={{ position: "sticky", top: 0, display: "flex", justifyContent: "center", background: "var(--surface-sheet)", padding: "12px 0" }}>
          <span aria-hidden style={{ height: 4, width: 40, borderRadius: "var(--radius-pill)", background: "var(--gh-ink-15)" }} />
        </div>
        {groups.map((g) => (
          <nav key={g.title} style={{ borderTop: "1px solid var(--gh-ink-07)", padding: "8px" }}>
            <p style={{ margin: 0, padding: "6px 12px", fontSize: "var(--text-11)", fontWeight: "var(--weight-semibold)", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--gh-ink-45)" }}>{g.title}</p>
            {g.items.map((it) => (
              <a key={it.href + it.label} href={it.href} onClick={(e) => { if (onNavigate) { e.preventDefault(); onNavigate(it.href); } }}
                style={{ display: "flex", alignItems: "center", gap: 12, borderRadius: "var(--radius-panel)", padding: "10px 12px", fontSize: "var(--text-sm)", color: "var(--gh-ink-80)", textDecoration: "none", minHeight: 44, boxSizing: "border-box" }}>
                <Icon name={it.icon} size={18} color="var(--gh-ink-45)" />
                <span>{it.label}</span>
              </a>
            ))}
          </nav>
        ))}
        <div style={{ borderTop: "1px solid var(--gh-ink-07)", padding: 8 }}>
          <button type="button" style={{ display: "flex", width: "100%", alignItems: "center", gap: 12, borderRadius: "var(--radius-panel)", border: 0, background: "none", padding: "10px 12px", textAlign: "left", fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "var(--status-danger)", cursor: "pointer" }}>
            <Icon name="ExternalLink" size={18} />
            Log out
          </button>
        </div>
        <p style={{ margin: 0, padding: "8px 20px 0", textAlign: "center", fontSize: "var(--text-xs)", color: "var(--gh-ink-40)" }}>Ganyu Hub v{version}</p>
      </div>
    </div>
  );
}
