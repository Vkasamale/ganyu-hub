/* Resolved at RENDER time, not module-eval time: the design-system bundle
   populates its namespace at the end of the bundle, so a top-level destructure
   here would capture undefined for every component. */
const DS = () => window.GanyuHubDesignSystem_1b2ec0;

function BrowseCreatives({ go }) {
  const { CreativeCard, SearchScope, PageTabs, Input, Select, Button, Badge, StyleChoices, EmptyState, Icon } = DS();
  const D = window.GH_DATA;
  const [cat, setCat] = React.useState("all");
  const [open, setOpen] = React.useState(true);
  const list = cat === "all" ? D.creatives : D.creatives.filter((c) => c.category === cat);
  return (
    <div style={{ margin: "0 auto", maxWidth: "var(--page-max)", padding: "32px var(--gutter-md) 80px" }}>
      <p className="gh-eyebrow" style={{ margin: 0 }}>Browse</p>
      <h1 style={{ margin: "6px 0 0", fontFamily: "var(--font-display)", fontSize: "var(--text-3xl)", fontWeight: 600 }}>Find someone to hire</h1>

      <div style={{ marginTop: 20, maxWidth: 720 }}><SearchScope current="creatives" onSelect={(k) => k === "jobs" && go("/jobs")} /></div>

      <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "260px 1fr", gap: 32, alignItems: "start" }}>
        <aside style={{ position: "sticky", top: 76, borderRadius: "var(--radius-panel)", border: "1px solid var(--gh-ink-10)", background: "var(--gh-white)", boxShadow: "var(--shadow-panel-soft)", padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ margin: 0, fontSize: "var(--text-sm)", fontWeight: 600 }}>Filters</p>
            <button type="button" onClick={() => setCat("all")} style={{ border: 0, background: "none", padding: 0, cursor: "pointer", fontSize: "var(--text-xs)", fontWeight: 500, color: "var(--gh-teal-dark)" }}>Clear all</button>
          </div>
          <div style={{ height: 1, background: "var(--gh-ink)", opacity: 0.18, margin: "12px 0" }} />
          <p className="gh-eyebrow" style={{ margin: "0 0 8px" }}>Category</p>
          <div style={{ display: "grid", gap: 4 }}>
            {["all"].concat(D.categories).map((c) => (
              <button key={c} type="button" onClick={() => setCat(c)}
                style={{ textAlign: "left", border: 0, borderRadius: "var(--radius-control)", cursor: "pointer", padding: "7px 10px", fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", background: cat === c ? "var(--gh-teal-10)" : "transparent", fontWeight: cat === c ? 500 : 400, color: cat === c ? "var(--gh-teal-dark)" : "var(--gh-ink-70)" }}>
                {c === "all" ? "All categories" : c}
              </button>
            ))}
          </div>
          <div style={{ height: 1, background: "var(--gh-ink)", opacity: 0.18, margin: "14px 0" }} />
          <p className="gh-eyebrow" style={{ margin: "0 0 8px" }}>Budget from</p>
          <Select defaultValue="Any"><option>Any</option><option>MWK 20,000+</option><option>MWK 50,000+</option><option>MWK 100,000+</option></Select>
          <div style={{ height: 1, background: "var(--gh-ink)", opacity: 0.18, margin: "14px 0" }} />
          <details open={open} onToggle={(e) => setOpen(e.currentTarget.open)}>
            <summary style={{ cursor: "pointer", listStyle: "none", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span className="gh-eyebrow">Visual style</span>
              <Icon name="ChevronDown" size={14} color="var(--gh-ink-45)" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform var(--dur-panel) var(--ease-out)" }} />
            </summary>
            <div style={{ marginTop: 10 }}>
              <StyleChoices name="styles" selected={["flat"]} style={{ gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 8 }} />
            </div>
          </details>
        </aside>

        <div>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <p style={{ margin: 0, fontSize: "var(--text-sm)", color: "var(--gh-ink-65)" }}>
              <span style={{ fontWeight: 600, color: "var(--gh-ink)" }}>{list.length}</span> {list.length === 1 ? "creative" : "creatives"}{cat !== "all" ? " in " + cat : ""}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: "var(--text-xs)", color: "var(--gh-ink-55)" }}>Sort</span>
              <Select defaultValue="Recommended" style={{ width: 190 }}><option>Recommended</option><option>Highest rated</option><option>Lowest price</option><option>Newest</option></Select>
            </div>
          </div>
          {list.length === 0 ? (
            <EmptyState style={{ marginTop: 24 }} title="Nothing here yet" body="No creatives in this category are taking work right now. Try another category, or post a job and let people come to you." actionLabel="Post a job" />
          ) : (
            <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 16 }}>
              {list.map((c) => <CreativeCard key={c.name} {...c} showSave />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { BrowseCreatives });
