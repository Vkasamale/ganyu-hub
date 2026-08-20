/* Resolved at RENDER time, not module-eval time: the design-system bundle
   populates its namespace at the end of the bundle, so a top-level destructure
   here would capture undefined for every component. */
const DS = () => window.GanyuHubDesignSystem_1b2ec0;

const mwk = (n) => (n == null ? "\u2014" : "MWK " + n.toLocaleString("en-GB"));

function EscrowRow({ label, value, strong }) {
  const { MoneyStamp, JobProgressBar, Button, Card, CardContent, Badge, PricingExplainer, Stars, VerifiedBadge, PageTabs, Textarea, Icon, EmptyState } = DS();
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, padding: "7px 0", borderBottom: "1px solid var(--gh-ink-07)" }}>
      <span style={{ fontSize: "var(--text-sm)", color: "var(--gh-ink-65)" }}>{label}</span>
      <span style={{ fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums", fontSize: "var(--text-sm)", fontWeight: strong ? 600 : 400, color: strong ? "var(--gh-ink)" : "var(--gh-ink-75)" }}>{value}</span>
    </div>
  );
}

function JobDetail({ go }) {
  const { MoneyStamp, JobProgressBar, Button, Card, CardContent, Badge, PricingExplainer, Stars, VerifiedBadge, PageTabs, Textarea, Icon, EmptyState } = DS();
  const job = window.GH_DATA.jobs[0];
  const [stage, setStage] = React.useState(2);
  const [tab, setTab] = React.useState("proposals");
  const money = stage >= 4 ? "payment_released" : stage >= 2 ? "payment_held" : stage === 1 ? "payment_pending" : "none";

  return (
    <div style={{ margin: "0 auto", maxWidth: "var(--page-max)", padding: "24px var(--gutter-md) 80px" }}>
      <nav style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "var(--text-xs)", color: "var(--gh-ink-55)" }}>
        <a href="#" onClick={(e) => { e.preventDefault(); go("/jobs"); }} style={{ color: "var(--gh-ink-55)", textDecoration: "none" }}>Find work</a>
        <span aria-hidden>/</span><span>{job.category}</span><span aria-hidden>/</span><span style={{ color: "var(--gh-ink-75)" }}>{job.title}</span>
      </nav>

      <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 340px", gap: 32, alignItems: "start" }}>
        <div style={{ display: "grid", gap: 20 }}>
          {/* Money-at-a-glance header */}
          <div style={{ borderRadius: "var(--radius-panel)", border: "1px solid var(--gh-ink-10)", background: "var(--gh-white)", padding: 24 }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
              <h1 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "var(--text-3xl)", fontWeight: 600, lineHeight: "var(--leading-tight)" }}>{job.title}</h1>
              <Badge tone="wash">{job.category}</Badge>
            </div>
            <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <div className="gh-price" style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-4xl)", fontVariantNumeric: "tabular-nums" }}>
                {job.budgetMwk.toLocaleString("en-GB")}
              </div>
              <MoneyStamp state={money} size="lg" />
            </div>
            <div style={{ marginTop: 8, fontSize: "var(--text-sm)", color: "var(--gh-ink-70)" }}>
              <div>{money === "payment_released" ? "Creative received, after cash-out fee" : "Creative receives (est., after cash-out fee)"}</div>
              <div style={{ marginTop: 2, display: "flex", flexWrap: "wrap", gap: "2px 20px" }}>
                <span><span style={{ fontWeight: 500, color: "var(--gh-ink)", fontVariantNumeric: "tabular-nums" }}>{mwk(116400)}</span> to mobile money</span>
                <span><span style={{ fontWeight: 500, color: "var(--gh-ink)", fontVariantNumeric: "tabular-nums" }}>{mwk(115700)}</span> to bank</span>
              </div>
              <div style={{ marginTop: 4, fontSize: "var(--text-xs)", color: "var(--gh-ink-55)" }}>
                Cash-out fees are charged by the payment provider, not Ganyu Hub &mdash; banks add a flat MWK 700 on top of the 3% both rails charge.
              </div>
            </div>
            <div style={{ marginTop: 24 }}><JobProgressBar currentIdx={stage} /></div>
          </div>

          <Card>
            <CardContent style={{ padding: 24 }}>
              <p className="gh-eyebrow" style={{ margin: 0 }}>The brief</p>
              <p style={{ margin: "10px 0 0", fontSize: "var(--text-base)", lineHeight: "var(--leading-relaxed)", color: "var(--gh-ink-80)", textWrap: "pretty" }}>{job.brief}</p>
              <div style={{ marginTop: 20, display: "flex", flexWrap: "wrap", gap: "8px 32px", fontSize: "var(--text-sm)", color: "var(--gh-ink-70)" }}>
                <span><span style={{ color: "var(--gh-ink-55)" }}>Posted</span> {job.postedAgo}</span>
                <span><span style={{ color: "var(--gh-ink-55)" }}>Deadline</span> 14th of September 2026</span>
                <span><span style={{ color: "var(--gh-ink-55)" }}>Location</span> Limbe, Blantyre</span>
              </div>
            </CardContent>
          </Card>

          <div>
            <PageTabs active={tab} onSelect={setTab} tabs={[{ key: "proposals", label: "Proposals", count: job.proposalsCount }, { key: "messages", label: "Messages", count: 2 }, { key: "files", label: "Files" }, { key: "activity", label: "Activity" }]} />
            <div style={{ marginTop: 16 }}>
              {tab === "proposals" && (
                <div style={{ display: "grid", gap: 12 }}>
                  {window.GH_DATA.creatives.slice(0, 3).map((c, i) => (
                    <div key={c.name} style={{ borderRadius: "var(--radius-card)", border: "1px solid rgba(0,0,0,0.06)", background: "var(--gh-white)", boxShadow: "var(--shadow-listing)", padding: 20 }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                        <span style={{ display: "flex", height: 40, width: 40, flexShrink: 0, alignItems: "center", justifyContent: "center", borderRadius: 999, background: "var(--gh-ink-85)", fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--gh-ground)" }}>
                          {c.name.split(" ").map((n) => n[0]).join("")}
                        </span>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
                            <p style={{ margin: 0, fontSize: "var(--text-sm)", fontWeight: 600 }}>{c.name}</p>
                            <VerifiedBadge verifiedAt={c.verifiedAt} />
                            {c.reviewCount > 0 && <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "var(--text-xs)", color: "var(--gh-ink-60)" }}><Stars value={c.rating} size={13} />{c.rating.toFixed(1)}</span>}
                          </div>
                          <p style={{ margin: "6px 0 0", fontSize: "var(--text-sm)", lineHeight: "var(--leading-relaxed)", color: "var(--gh-ink-75)" }}>
                            {["I would do the wordmark first so the sign painter can quote before the rest is finished. Two colours, and I will supply the paint codes.",
                              "I have done three shopfronts in Limbe. I can share the files the painter used.",
                              "Happy to work to your budget. I would need the bakery name and any photos of the shopfront."][i]}
                          </p>
                          <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, borderRadius: "var(--radius-panel)", background: "var(--gh-mark-10)", padding: "5px 10px", fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--gh-mark)" }}>
                              <Icon name="HandCoins" size={14} />{mwk([115000, 120000, 98000][i])}
                            </span>
                            <div style={{ display: "flex", gap: 8 }}>
                              <Button variant="outline" size="sm">Message</Button>
                              <Button size="sm" onClick={() => setStage(1)}>Hire {c.name.split(" ")[0]}</Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {tab === "messages" && <EmptyState tone="quiet" title="No messages on this job yet." body="Message a creative from their proposal and the thread appears here." />}
              {tab === "files" && <EmptyState title="No files yet" body="Delivered work and reference files both land here. Nothing has been uploaded." />}
              {tab === "activity" && (
                <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 0 }}>
                  {[["Money moved into escrow", "MWK 120,000 held", "3 days ago"], ["Thandiwe Banda hired", "Bid accepted at MWK 115,000", "4 days ago"], ["Job posted", "Budget MWK 120,000", "5 days ago"]].map(([t, s, w]) => (
                    <li key={t} style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "12px 0", borderBottom: "1px solid var(--gh-ink-07)" }}>
                      <div><p style={{ margin: 0, fontSize: "var(--text-sm)", fontWeight: 500 }}>{t}</p><p style={{ margin: "2px 0 0", fontSize: "var(--text-xs)", color: "var(--gh-ink-60)" }}>{s}</p></div>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-11)", color: "var(--gh-ink-45)", whiteSpace: "nowrap" }}>{w}</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        </div>

        {/* Sticky right rail */}
        <aside style={{ position: "sticky", top: 76, display: "grid", gap: 16 }}>
          <Card>
            <CardContent style={{ padding: 20 }}>
              <p className="gh-eyebrow" style={{ margin: 0 }}>Escrow</p>
              <div style={{ marginTop: 10 }}>
                <EscrowRow label="Agreed price" value={mwk(115000)} />
                <EscrowRow label="Processing fee (~3%)" value={mwk(3450)} />
                <EscrowRow label="Platform commission" value="MWK 0 (beta)" />
                <EscrowRow label="You pay" value={mwk(118450)} strong />
              </div>
              <div style={{ marginTop: 16, display: "grid", gap: 8 }}>
                {stage < 2 && <Button style={{ width: "100%" }} onClick={() => setStage(2)}>Fund escrow &middot; {mwk(118450)}</Button>}
                {stage === 2 && <Button style={{ width: "100%" }} onClick={() => setStage(3)}>Mark work delivered</Button>}
                {stage === 3 && <Button style={{ width: "100%" }} onClick={() => setStage(4)}>Approve &amp; release payment</Button>}
                {stage >= 4 && <Button variant="outline" style={{ width: "100%" }} disabled>Released to creative</Button>}
                <Button variant="outline" style={{ width: "100%" }}>Message Thandiwe</Button>
                {stage > 0 && stage < 4 && <Button variant="ghost" size="sm" style={{ width: "100%", color: "var(--status-danger)" }}>Open a dispute</Button>}
              </div>
            </CardContent>
          </Card>
          <PricingExplainer audience="client" />
          <div style={{ borderRadius: "var(--radius-panel)", border: "1px solid var(--gh-ink-10)", background: "var(--surface-inset)", padding: 16 }}>
            <p style={{ margin: 0, fontSize: "var(--text-sm)", fontWeight: 600 }}>About {job.clientName}</p>
            <ul style={{ margin: "8px 0 0", padding: 0, listStyle: "none", display: "grid", gap: 5, fontSize: "var(--text-xs)", color: "var(--gh-ink-70)" }}>
              {job.trustBits.map((b) => <li key={b} style={{ display: "flex", gap: 8 }}><Icon name="Check" size={13} color="var(--gh-mark)" />{b}</li>)}
              <li style={{ display: "flex", gap: 8 }}><Icon name="Clock" size={13} color="var(--gh-ink-45)" />Usually replies within a day</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

Object.assign(window, { JobDetail });
