/* Resolved at RENDER time, not module-eval time: the design-system bundle
   populates its namespace at the end of the bundle, so a top-level destructure
   here would capture undefined for every component. */
const DS = () => window.GanyuHubDesignSystem_1b2ec0;

const mwk = (n) => (n == null ? "\u2014" : "MWK " + n.toLocaleString("en-GB"));
const GUT = 16;

/* ── The app's top bar. Logo + search + bell. No nav — the tab bar owns that. */
function AppBar({ title, back, onBack }) {
  const { Logo, Icon, Button, Input, Select, Label, Textarea, Badge, Card, CardContent, CreativeCard, JobCard, FeedCarousel, FeedCard, MoneyStamp, JobProgressBar, MoneyInput, PricingExplainer, PageTabs, SearchScope, EmptyState, Stars, VerifiedBadge, StyleChoices, TagInput, SaveButton } = DS();
  return (
    <header style={{ position: "sticky", top: 0, zIndex: 20, background: "var(--surface-bar)", backdropFilter: "blur(8px)", borderBottom: "1px solid var(--border-hairline)", boxShadow: "var(--elev-2)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px " + GUT + "px", minHeight: 52 }}>
        {back ? (
          <button type="button" onClick={onBack} aria-label="Back" style={{ display: "flex", height: 36, width: 36, marginLeft: -8, alignItems: "center", justifyContent: "center", border: 0, background: "none", cursor: "pointer" }}>
            <Icon name="ArrowLeft" size={20} color="var(--gh-ink)" />
          </button>
        ) : (
          <Logo size="sm" markSrc="../../assets/logo-g.png" />
        )}
        {title && <p style={{ margin: 0, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "var(--text-base)", fontWeight: 600 }}>{title}</p>}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4 }}>
          <button type="button" aria-label="Search" style={{ display: "flex", height: 44, width: 44, alignItems: "center", justifyContent: "center", border: 0, background: "none", cursor: "pointer" }}>
            <Icon name="Search" size={20} color="var(--gh-ink-70)" />
          </button>
          <button type="button" aria-label="Notifications" style={{ position: "relative", display: "flex", height: 44, width: 44, alignItems: "center", justifyContent: "center", border: 0, background: "none", cursor: "pointer" }}>
            <Icon name="Bell" size={20} color="var(--gh-ink-70)" />
            <span style={{ position: "absolute", top: 11, right: 12, height: 7, width: 7, borderRadius: 999, background: "var(--gh-teal)" }} />
          </button>
        </div>
      </div>
    </header>
  );
}

/* ── 1. Signed-in home: welcome, ways in, then peeking rails ─────────── */
function HomeFeed({ go, role }) {
  const { Logo, Icon, Button, Input, Select, Label, Textarea, Badge, Card, CardContent, CreativeCard, JobCard, FeedCarousel, FeedCard, MoneyStamp, JobProgressBar, MoneyInput, PricingExplainer, PageTabs, SearchScope, EmptyState, Stars, VerifiedBadge, StyleChoices, TagInput, SaveButton } = DS();
  const D = window.GH_DATA;
  const client = role === "client";
  const ways = client
    ? [["Post a job", "Describe it once, get proposals.", "FilePlus", "/jobs/new"], ["Find someone", "Browse people by skill and price.", "Search", "/browse"]]
    : [["Find work", "Jobs posted this week, with budgets.", "Search", "/jobs"], ["Update your rates", "A rate card gets you more replies.", "List", "/jobs"]];
  return (
    <div style={{ paddingBottom: 24 }}>
      <div style={{ padding: GUT + "px " + GUT + "px 0" }}>
        <p className="gh-eyebrow" style={{ margin: 0 }}>Wednesday, 13 August</p>
        <h1 style={{ margin: "6px 0 0", fontFamily: "var(--font-display)", fontSize: "var(--text-3xl)", fontWeight: 600, lineHeight: "var(--leading-tight)" }}>
          {client ? <>Welcome back, <i>Grace</i>.</> : <>Welcome back, <i>Thandiwe</i>.</>}
        </h1>
        <p style={{ margin: "6px 0 0", fontSize: "var(--text-sm)", color: "var(--gh-ink-65)" }}>
          {client ? "One job is waiting on your approval." : "MWK 65,000 is held in escrow on two jobs."}
        </p>

        <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
          {ways.map(([t, s, ic, href]) => (
            <a key={t} href="#" onClick={(e) => { e.preventDefault(); go(href); }}
              style={{ display: "flex", alignItems: "center", gap: 12, borderRadius: "var(--radius-inset)", border: "1px solid var(--border-card)", background: "var(--gh-white)", boxShadow: "var(--shadow-panel-soft)", padding: 14, textDecoration: "none", minHeight: 44 }}>
              <span style={{ display: "flex", height: 40, width: 40, flexShrink: 0, alignItems: "center", justifyContent: "center", borderRadius: "var(--radius-panel)", background: "var(--gh-teal-10)" }}>
                <Icon name={ic} size={20} color="var(--gh-teal-dark)" />
              </span>
              <span style={{ minWidth: 0, flex: 1 }}>
                <span style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--gh-ink)" }}>{t}</span>
                <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--gh-ink-60)" }}>{s}</span>
              </span>
              <Icon name="ArrowRight" size={16} color="var(--gh-ink-40)" />
            </a>
          ))}
        </div>

        {/* Money you can see without opening anything */}
        <div style={{ marginTop: 16, borderRadius: "var(--radius-card)", border: "1px solid var(--gh-ink-10)", background: "var(--gh-white)", padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <div>
              <p className="gh-eyebrow" style={{ margin: 0 }}>In escrow</p>
              <p className="gh-price" style={{ margin: "4px 0 0", fontFamily: "var(--font-display)", fontSize: "var(--text-3xl)", fontVariantNumeric: "tabular-nums" }}>185,000</p>
            </div>
            <MoneyStamp state="payment_held" />
          </div>
          <a href="#" onClick={(e) => { e.preventDefault(); go("/dashboard/jobs"); }} style={{ display: "inline-block", marginTop: 10, fontSize: "var(--text-xs)", fontWeight: 500, color: "var(--gh-teal-dark)" }}>Across 2 jobs &rarr;</a>
        </div>
      </div>

      <div style={{ marginTop: 24, paddingLeft: GUT }}>
        <FeedCarousel eyebrow="Near you" title={client ? "Creatives in Blantyre" : "Jobs in Blantyre"} seeAllHref="#" count={D.creatives.length} style={{ "--carousel-card": "232px" }}>
          {D.creatives.map((c) => <FeedCard key={c.name} style={{ width: 232 }}><CreativeCard {...c} showSave /></FeedCard>)}
        </FeedCarousel>
      </div>

      <div style={{ marginTop: 28, padding: "0 " + GUT + "px" }}>
        <p className="gh-eyebrow" style={{ margin: 0 }}>{client ? "Your jobs" : "New this week"}</p>
        <h2 style={{ margin: "4px 0 12px", fontSize: "var(--text-lg)", fontWeight: 600 }}>{client ? "Waiting on you" : "Work you could take"}</h2>
        <div style={{ display: "grid", gap: 12 }}>
          {D.jobs.slice(0, 2).map((j) => (
            <div key={j.id} onClick={() => go("/jobs/j1")}><JobCard {...j} showSave /></div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── 2. Jobs list ─────────────────────────────────────────────────────── */
function JobsMobile({ go }) {
  const { Logo, Icon, Button, Input, Select, Label, Textarea, Badge, Card, CardContent, CreativeCard, JobCard, FeedCarousel, FeedCard, MoneyStamp, JobProgressBar, MoneyInput, PricingExplainer, PageTabs, SearchScope, EmptyState, Stars, VerifiedBadge, StyleChoices, TagInput, SaveButton } = DS();
  const D = window.GH_DATA;
  const [tab, setTab] = React.useState("all");
  return (
    <div style={{ padding: GUT + "px " + GUT + "px 24px" }}>
      <h1 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "var(--text-2xl)", fontWeight: 600 }}>Find work to do</h1>
      <div style={{ marginTop: 14 }}><SearchScope current="jobs" onSelect={(k) => k === "creatives" && go("/browse")} style={{ gridTemplateColumns: "1fr" }} /></div>
      <div style={{ marginTop: 16 }}>
        <PageTabs active={tab} onSelect={setTab} tabs={[{ key: "all", label: "All open", count: D.jobs.length }, { key: "funded", label: "Client has paid before", count: 3 }, { key: "saved", label: "Saved" }]} />
      </div>
      {tab === "saved" ? (
        <EmptyState style={{ marginTop: 20, padding: "40px 20px" }} title="Nothing saved yet" body="Tap the heart on a job to keep it here." actionLabel="Browse open jobs" />
      ) : (
        <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
          {(tab === "funded" ? D.jobs.filter((j) => j.trustBits.indexOf("Has paid into escrow") > -1) : D.jobs).map((j) => (
            <div key={j.id} onClick={() => go("/jobs/j1")}><JobCard {...j} showSave /></div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── 3. Browse creatives ──────────────────────────────────────────────── */
function BrowseMobile({ go }) {
  const { Logo, Icon, Button, Input, Select, Label, Textarea, Badge, Card, CardContent, CreativeCard, JobCard, FeedCarousel, FeedCard, MoneyStamp, JobProgressBar, MoneyInput, PricingExplainer, PageTabs, SearchScope, EmptyState, Stars, VerifiedBadge, StyleChoices, TagInput, SaveButton } = DS();
  const D = window.GH_DATA;
  const [cat, setCat] = React.useState("all");
  const list = cat === "all" ? D.creatives : D.creatives.filter((c) => c.category === cat);
  return (
    <div style={{ padding: GUT + "px 0 24px" }}>
      <div style={{ padding: "0 " + GUT + "px" }}>
        <h1 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "var(--text-2xl)", fontWeight: 600 }}>Find someone to hire</h1>
        <Input placeholder="e.g. wedding photographer in Lilongwe" style={{ marginTop: 12 }} />
      </div>
      <div style={{ marginTop: 12, display: "flex", gap: 8, overflowX: "auto", padding: "0 " + GUT + "px", scrollbarWidth: "none" }}>
        {["all"].concat(D.categories).map((c) => (
          <button key={c} type="button" onClick={() => setCat(c)}
            style={{ flexShrink: 0, borderRadius: 999, cursor: "pointer", padding: "7px 14px", fontFamily: "var(--font-body)", fontSize: "var(--text-xs)", fontWeight: 500, whiteSpace: "nowrap",
              border: "1px solid " + (cat === c ? "var(--gh-teal)" : "var(--gh-ink-15)"),
              background: cat === c ? "var(--gh-teal)" : "var(--gh-white)", color: cat === c ? "#fff" : "var(--gh-ink-70)" }}>
            {c === "all" ? "All" : c}
          </button>
        ))}
      </div>
      <div style={{ marginTop: 16, padding: "0 " + GUT + "px" }}>
        <details style={{ borderRadius: "var(--radius-panel)", border: "1px solid var(--gh-ink-10)", background: "var(--surface-inset)", padding: "10px 12px" }}>
          <summary style={{ cursor: "pointer", listStyle: "none", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "var(--text-sm)", fontWeight: 500 }}>
            Visual style<Icon name="ChevronDown" size={14} color="var(--gh-ink-45)" />
          </summary>
          <div style={{ marginTop: 10 }}><StyleChoices name="styles" selected={["flat"]} style={{ gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 8 }} /></div>
        </details>
        {list.length === 0 ? (
          <EmptyState style={{ marginTop: 20, padding: "40px 20px" }} title="Nothing here yet" body="No creatives in this category are taking work right now." actionLabel="Post a job" />
        ) : (
          <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
            {list.map((c) => <CreativeCard key={c.name} {...c} showSave />)}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── 4. Job detail with the sticky action bar ─────────────────────────── */
function JobDetailMobile({ go, stage, setStage }) {
  const { Logo, Icon, Button, Input, Select, Label, Textarea, Badge, Card, CardContent, CreativeCard, JobCard, FeedCarousel, FeedCard, MoneyStamp, JobProgressBar, MoneyInput, PricingExplainer, PageTabs, SearchScope, EmptyState, Stars, VerifiedBadge, StyleChoices, TagInput, SaveButton } = DS();
  const job = window.GH_DATA.jobs[0];
  const money = stage >= 4 ? "payment_released" : stage >= 2 ? "payment_held" : stage === 1 ? "payment_pending" : "none";
  const action = stage < 2 ? "Fund escrow" : stage === 2 ? "Mark delivered" : stage === 3 ? "Release payment" : "Released";
  return (
    <div style={{ padding: GUT + "px " + GUT + "px 96px" }}>
      <div style={{ borderRadius: "var(--radius-panel)", border: "1px solid var(--gh-ink-10)", background: "var(--gh-white)", padding: 20 }}>
        <h1 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "var(--text-2xl)", fontWeight: 600, lineHeight: "var(--leading-tight)" }}>{job.title}</h1>
        <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div className="gh-price" style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-3xl)", fontVariantNumeric: "tabular-nums" }}>{job.budgetMwk.toLocaleString("en-GB")}</div>
          <MoneyStamp state={money} />
        </div>
        <div style={{ marginTop: 8, fontSize: "var(--text-sm)", color: "var(--gh-ink-70)" }}>
          <div>{money === "payment_released" ? "Creative received, after cash-out fee" : "Creative receives (est., after cash-out fee)"}</div>
          <div style={{ marginTop: 2, display: "flex", flexWrap: "wrap", gap: "2px 16px" }}>
            <span><span style={{ fontWeight: 500, color: "var(--gh-ink)", fontVariantNumeric: "tabular-nums" }}>{mwk(116400)}</span> to mobile money</span>
            <span><span style={{ fontWeight: 500, color: "var(--gh-ink)", fontVariantNumeric: "tabular-nums" }}>{mwk(115700)}</span> to bank</span>
          </div>
        </div>
        <div style={{ marginTop: 20 }}><JobProgressBar currentIdx={stage} /></div>
      </div>

      <div style={{ marginTop: 16, borderRadius: "var(--radius-card)", border: "1px solid var(--border-card)", background: "var(--gh-white)", boxShadow: "var(--shadow-listing)", padding: 20 }}>
        <p className="gh-eyebrow" style={{ margin: 0 }}>The brief</p>
        <p style={{ margin: "10px 0 0", fontSize: "var(--text-sm)", lineHeight: "var(--leading-relaxed)", color: "var(--gh-ink-80)", textWrap: "pretty" }}>{job.brief}</p>
        <div style={{ marginTop: 16, display: "grid", gap: 6, fontSize: "var(--text-xs)", color: "var(--gh-ink-70)" }}>
          <span><span style={{ color: "var(--gh-ink-55)" }}>Posted</span> {job.postedAgo} by {job.clientName}</span>
          <span><span style={{ color: "var(--gh-ink-55)" }}>Deadline</span> 14th of September 2026</span>
        </div>
      </div>

      <div style={{ marginTop: 16 }}><PricingExplainer audience="client" /></div>

      <p className="gh-eyebrow" style={{ margin: "24px 0 10px" }}>Proposals &middot; {job.proposalsCount}</p>
      <div style={{ display: "grid", gap: 12 }}>
        {window.GH_DATA.creatives.slice(0, 2).map((c, i) => (
          <div key={c.name} style={{ borderRadius: "var(--radius-card)", border: "1px solid var(--border-card)", background: "var(--gh-white)", boxShadow: "var(--shadow-listing)", padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ display: "flex", height: 36, width: 36, flexShrink: 0, alignItems: "center", justifyContent: "center", borderRadius: 999, background: "var(--gh-ink-85)", fontSize: "var(--text-11)", fontWeight: 600, color: "var(--gh-ground)" }}>
                {c.name.split(" ").map((n) => n[0]).join("")}
              </span>
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: "var(--text-sm)", fontWeight: 600 }}>{c.name}</p>
                <span style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                  {c.reviewCount > 0 ? <><Stars value={c.rating} size={12} /><span style={{ fontSize: "var(--text-11)", color: "var(--gh-ink-60)" }}>{c.rating.toFixed(1)} &middot; {c.reviewCount} reviews</span></>
                    : <span style={{ fontSize: "var(--text-11)", color: "var(--gh-ink-60)" }}>New &middot; no reviews yet</span>}
                </span>
              </div>
              <span style={{ marginLeft: "auto" }}><VerifiedBadge verifiedAt={c.verifiedAt} /></span>
            </div>
            <p style={{ margin: "10px 0 0", fontSize: "var(--text-sm)", lineHeight: "var(--leading-relaxed)", color: "var(--gh-ink-75)" }}>
              {["I would do the wordmark first so the sign painter can quote before the rest is finished. Two colours, and I will supply the paint codes.",
                "I have done three shopfronts in Limbe. I can share the files the painter used."][i]}
            </p>
            <div style={{ marginTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, borderRadius: "var(--radius-panel)", background: "var(--gh-mark-10)", padding: "5px 10px", fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--gh-mark)" }}>
                <Icon name="HandCoins" size={14} />{mwk([115000, 120000][i])}
              </span>
              <Button size="sm" onClick={() => setStage(1)}>Hire</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── 5. Messages ──────────────────────────────────────────────────────── */
function MessagesMobile({ go }) {
  const { Logo, Icon, Button, Input, Select, Label, Textarea, Badge, Card, CardContent, CreativeCard, JobCard, FeedCarousel, FeedCard, MoneyStamp, JobProgressBar, MoneyInput, PricingExplainer, PageTabs, SearchScope, EmptyState, Stars, VerifiedBadge, StyleChoices, TagInput, SaveButton } = DS();
  const D = window.GH_DATA;
  return (
    <div style={{ paddingBottom: 24 }}>
      <div style={{ padding: GUT + "px " + GUT + "px 0" }}>
        <h1 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "var(--text-2xl)", fontWeight: 600 }}>Messages</h1>
      </div>
      <ul style={{ margin: "12px 0 0", padding: 0, listStyle: "none" }}>
        {D.threads.map((t) => (
          <li key={t.name}>
            <a href="#" onClick={(e) => { e.preventDefault(); go("/jobs/j1"); }}
              style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "14px " + GUT + "px", borderBottom: "1px solid var(--gh-ink-07)", textDecoration: "none", minHeight: 44 }}>
              <span style={{ display: "flex", height: 40, width: 40, flexShrink: 0, alignItems: "center", justifyContent: "center", borderRadius: 999, background: "var(--gh-ink-85)", fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--gh-ground)" }}>
                {t.name.split(" ").map((n) => n[0]).join("")}
              </span>
              <span style={{ minWidth: 0, flex: 1 }}>
                <span style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: t.unread ? 600 : 500, color: "var(--gh-ink)" }}>{t.name}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-10)", color: "var(--gh-ink-45)", whiteSpace: "nowrap" }}>{t.when}</span>
                </span>
                <span style={{ display: "block", marginTop: 1, fontSize: "var(--text-11)", color: "var(--gh-ink-55)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.job}</span>
                <span style={{ display: "block", marginTop: 4, fontSize: "var(--text-xs)", lineHeight: "var(--leading-snug)", color: t.unread ? "var(--gh-ink-80)" : "var(--gh-ink-60)" }}>{t.last}</span>
              </span>
              {t.unread > 0 && (
                <span style={{ flexShrink: 0, minWidth: 18, borderRadius: 999, background: "var(--gh-teal)", padding: "0 5px", fontSize: "var(--text-10)", fontWeight: 700, lineHeight: "18px", color: "var(--gh-ground)", textAlign: "center" }}>{t.unread}</span>
              )}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── 6. Post a job (the deliberate button, not a tab) ─────────────────── */
function PostJobMobile({ go }) {
  const { Logo, Icon, Button, Input, Select, Label, Textarea, Badge, Card, CardContent, CreativeCard, JobCard, FeedCarousel, FeedCard, MoneyStamp, JobProgressBar, MoneyInput, PricingExplainer, PageTabs, SearchScope, EmptyState, Stars, VerifiedBadge, StyleChoices, TagInput, SaveButton } = DS();
  const [step, setStep] = React.useState(0);
  const steps = ["What you need", "Budget & deadline", "Review"];
  return (
    <div style={{ padding: GUT + "px " + GUT + "px 96px" }}>
      <p className="gh-eyebrow" style={{ margin: 0 }}>Step {step + 1} of 3</p>
      <h1 style={{ margin: "6px 0 0", fontFamily: "var(--font-display)", fontSize: "var(--text-2xl)", fontWeight: 600 }}>{steps[step]}</h1>
      <div style={{ marginTop: 14, display: "flex", gap: 4 }}>
        {steps.map((s, i) => <span key={s} style={{ height: 3, flex: 1, borderRadius: 999, background: i <= step ? "var(--gh-teal)" : "var(--gh-ink-10)", transition: "background-color var(--dur-panel) var(--ease-out)" }} />)}
      </div>

      <div style={{ marginTop: 20, display: "grid", gap: 16 }}>
        {step === 0 && (
          <>
            <div><Label htmlFor="t">What do you need done?</Label><Input id="t" defaultValue="Logo and signage for a new bakery" style={{ marginTop: 6 }} /></div>
            <div><Label htmlFor="c">Category</Label><Select id="c" defaultValue="Design" style={{ marginTop: 6 }}>{window.GH_DATA.categories.map((c) => <option key={c}>{c}</option>)}</Select></div>
            <div>
              <Label htmlFor="b">Describe the work</Label>
              <Textarea id="b" rows={5} defaultValue={window.GH_DATA.jobs[0].brief} style={{ marginTop: 6 }} />
              <p style={{ margin: "4px 0 0", fontSize: "var(--text-11)", color: "var(--gh-ink-55)" }}>The more specific you are, the fewer questions you will get back.</p>
            </div>
            <div><Label>Skills you are looking for</Label><div style={{ marginTop: 6 }}><TagInput name="skills" defaultValue={["Logo design"]} placeholder="Add a skill" /></div></div>
          </>
        )}
        {step === 1 && (
          <>
            <div><Label htmlFor="bud">Your budget</Label><div style={{ marginTop: 6 }}><MoneyInput id="bud" name="budget_mwk" defaultValue={120000} /></div>
              <p style={{ margin: "4px 0 0", fontSize: "var(--text-11)", color: "var(--gh-ink-55)" }}>You can leave this open, but jobs with a budget get about twice as many proposals.</p></div>
            <div><Label htmlFor="d">Deadline</Label><Input id="d" type="date" defaultValue="2026-09-14" style={{ marginTop: 6 }} /></div>
            <div><Label htmlFor="l">Where is the work?</Label><Input id="l" defaultValue="Limbe, Blantyre" style={{ marginTop: 6 }} /></div>
            <PricingExplainer audience="client" />
          </>
        )}
        {step === 2 && (
          <>
            <div style={{ borderRadius: "var(--radius-card)", border: "1px solid var(--border-card)", background: "var(--gh-white)", boxShadow: "var(--shadow-listing)", padding: 20 }}>
              <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", fontWeight: 600 }}>Logo and signage for a new bakery</h2>
              <div style={{ marginTop: 10, display: "inline-flex", alignItems: "center", gap: 6, borderRadius: "var(--radius-panel)", background: "var(--gh-mark-10)", padding: "6px 12px", fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--gh-mark)" }}>
                <Icon name="HandCoins" size={16} />Budget: {mwk(120000)}
              </div>
              <p style={{ margin: "12px 0 0", fontSize: "var(--text-sm)", lineHeight: "var(--leading-relaxed)", color: "var(--gh-ink-75)" }}>{window.GH_DATA.jobs[0].brief}</p>
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, borderRadius: "var(--radius-panel)", background: "var(--surface-inset)", border: "1px solid var(--gh-ink-10)", padding: 14 }}>
              <Icon name="ShieldCheck" size={18} color="var(--gh-teal)" />
              <p style={{ margin: 0, fontSize: "var(--text-xs)", lineHeight: "var(--leading-snug)", color: "var(--gh-ink-70)" }}>
                Posting is free. Nothing leaves your account until you pick someone and fund the job.
              </p>
            </div>
          </>
        )}
      </div>

      <div style={{ marginTop: 24, display: "flex", gap: 10 }}>
        {step > 0 && <Button variant="outline" size="lg" onClick={() => setStep(step - 1)} style={{ flex: 1 }}>Back</Button>}
        <Button size="lg" style={{ flex: 2 }} onClick={() => (step < 2 ? setStep(step + 1) : go("/jobs/j1"))}>
          {step < 2 ? "Continue" : "Post the job"}
        </Button>
      </div>
    </div>
  );
}

Object.assign(window, { AppBar, HomeFeed, JobsMobile, BrowseMobile, JobDetailMobile, MessagesMobile, PostJobMobile });
