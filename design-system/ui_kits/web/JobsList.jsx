/* Resolved at RENDER time, not module-eval time: the design-system bundle
   populates its namespace at the end of the bundle, so a top-level destructure
   here would capture undefined for every component. */
const DS = () => window.GanyuHubDesignSystem_1b2ec0;

function JobsList({ go }) {
  const { JobCard, SearchScope, Select, PageTabs, EmptyState } = DS();
  const D = window.GH_DATA;
  const [tab, setTab] = React.useState("all");
  const list = tab === "funded" ? D.jobs.filter((j) => j.trustBits.indexOf("Has paid into escrow") > -1) : D.jobs;
  return (
    <div style={{ margin: "0 auto", maxWidth: "var(--page-max)", padding: "32px var(--gutter-md) 80px" }}>
      <p className="gh-eyebrow" style={{ margin: 0 }}>Open jobs</p>
      <h1 style={{ margin: "6px 0 0", fontFamily: "var(--font-display)", fontSize: "var(--text-3xl)", fontWeight: 600 }}>Find work to do</h1>
      <div style={{ marginTop: 20, maxWidth: 720 }}><SearchScope current="jobs" onSelect={(k) => k === "creatives" && go("/browse")} /></div>
      <div style={{ marginTop: 24, display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
        <PageTabs active={tab} onSelect={setTab} tabs={[{ key: "all", label: "All open", count: D.jobs.length }, { key: "funded", label: "Client has paid before", count: 3 }, { key: "saved", label: "Saved" }]} />
        <Select defaultValue="Newest" style={{ width: 180 }}><option>Newest</option><option>Highest budget</option><option>Fewest proposals</option></Select>
      </div>
      {tab === "saved" ? (
        <EmptyState style={{ marginTop: 24 }} title="Nothing saved yet" body="Tap the heart on a job to keep it here while you decide whether to write a proposal." actionLabel="Browse open jobs" />
      ) : (
        <div style={{ marginTop: 20, display: "grid", gap: 16 }}>
          {list.map((j) => <div key={j.id} onClick={() => go("/jobs/j1")} style={{ cursor: "pointer" }}><JobCard {...j} showSave /></div>)}
        </div>
      )}
    </div>
  );
}

Object.assign(window, { JobsList });
