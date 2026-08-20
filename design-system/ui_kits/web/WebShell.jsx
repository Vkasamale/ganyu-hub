/* Resolved at RENDER time, not module-eval time: the design-system bundle
   populates its namespace at the end of the bundle, so a top-level destructure
   here would capture undefined for every component. */
const DS = () => window.GanyuHubDesignSystem_1b2ec0;

function WebHeader({ role, route, go, onRole }) {
  const { Logo, PrimaryNav, CLIENT_NAV, CREATIVE_NAV, Icon, Input, Button } = DS();
  return (
    <header style={{ position: "sticky", top: 0, zIndex: 30, background: "var(--surface-bar)", backdropFilter: "blur(8px)", borderBottom: "1px solid var(--border-hairline)", boxShadow: "var(--elev-2)" }}>
      <div style={{ margin: "0 auto", maxWidth: "var(--page-max)", display: "flex", alignItems: "center", gap: 24, padding: "12px var(--gutter-md)" }}>
        <a href="#" onClick={(e) => { e.preventDefault(); go("/"); }} style={{ textDecoration: "none" }}>
          <Logo size="md" markSrc="../../assets/logo-g.png" />
        </a>
        <PrimaryNav items={role === "client" ? CLIENT_NAV : CREATIVE_NAV} active={route} onNavigate={go} />
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
          <button type="button" onClick={() => onRole(role === "client" ? "creative" : "client")}
            style={{ border: "1px solid var(--gh-ink-15)", background: "transparent", borderRadius: "var(--radius-pill)", padding: "5px 12px", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--gh-ink-60)", cursor: "pointer" }}>
            viewing as {role}
          </button>
          <span style={{ position: "relative", display: "flex" }}>
            <Icon name="Bell" size={20} color="var(--gh-ink-65)" />
            <span style={{ position: "absolute", top: -2, right: -3, height: 8, width: 8, borderRadius: 999, background: "var(--gh-teal)" }} />
          </span>
          <Button size="sm" onClick={() => go("/jobs/new")}>Post a job</Button>
          <span style={{ display: "flex", height: 32, width: 32, alignItems: "center", justifyContent: "center", borderRadius: 999, background: "var(--gh-ink-85)", fontSize: "var(--text-11)", fontWeight: 600, color: "var(--gh-ground)" }}>GP</span>
        </div>
      </div>
    </header>
  );
}

function WebFooter() {
  const { Logo, PrimaryNav, CLIENT_NAV, CREATIVE_NAV, Icon, Input, Button } = DS();
  const col = (title, items) => (
    <div key={title}>
      <p className="gh-eyebrow" style={{ margin: 0 }}>{title}</p>
      <ul style={{ margin: "12px 0 0", padding: 0, listStyle: "none", display: "grid", gap: 8 }}>
        {items.map((i) => <li key={i}><a href="#" onClick={(e) => e.preventDefault()} style={{ fontSize: "var(--text-sm)", color: "var(--gh-ink-70)", textDecoration: "none" }}>{i}</a></li>)}
      </ul>
    </div>
  );
  return (
    <footer style={{ borderTop: "1px solid var(--gh-ink-10)", background: "var(--surface-band)", padding: "48px 0 32px" }}>
      <div style={{ margin: "0 auto", maxWidth: "var(--page-max)", padding: "0 var(--gutter-md)", display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr", gap: 40 }}>
        <div>
          <Logo size="sm" markSrc="../../assets/logo-g.png" />
          <p style={{ margin: "12px 0 0", maxWidth: "34ch", fontSize: "var(--text-sm)", lineHeight: "var(--leading-relaxed)", color: "var(--gh-ink-65)" }}>
            Malawi&rsquo;s creative marketplace. Money held in escrow until the work is approved.
          </p>
          <p className="gh-eyebrow" style={{ margin: "16px 0 0", letterSpacing: "var(--tracking-city)" }}>Blantyre &middot; Lilongwe &middot; Mzuzu</p>
        </div>
        {col("For clients", ["Post a job", "Browse creatives", "How the money works", "Report a problem"])}
        {col("For creatives", ["Find work", "Build a portfolio", "Set your rates", "Get paid"])}
        {col("Company", ["About", "Terms", "Privacy", "What's new"])}
      </div>
    </footer>
  );
}

Object.assign(window, { WebHeader, WebFooter });
