/* Resolved at RENDER time, not module-eval time: the design-system bundle
   populates its namespace at the end of the bundle, so a top-level destructure
   here would capture undefined for every component. */
const DS = () => window.GanyuHubDesignSystem_1b2ec0;

/* The two-mode hero. Client mode is paper on ink; creative mode inverts to
   black on paper with a lighter teal accent. Copy is verbatim from the product. */
const HERO = {
  client: {
    bg: "#F7F6F3", text: "hsl(0, 14%, 17%)", textMuted: "hsla(0, 14%, 17%, 0.70)",
    accent: "hsl(180, 92%, 30%)", badgeBorder: "rgba(0,0,0,0.10)", badgeBg: "rgba(255,255,255,0.60)",
    primaryBg: "hsl(180, 92%, 30%)", primaryText: "#FFFFFF", secondaryBorder: "rgba(0,0,0,0.15)",
    searchBorder: "hsla(180, 92%, 30%, 0.30)", searchBg: "#FFFFFF", tabBarBg: "rgba(0,0,0,0.05)",
    cityText: "hsla(0, 14%, 17%, 0.65)",
    badge: "Malawi's creative marketplace \u2726", line1: "Hire", line2: "Malawian creatives.", line2Italic: false,
    sub: "A working press for designers, developers, photographers, and writers across Lilongwe, Blantyre, and Mzuzu.",
    placeholder: "e.g. wedding photographer in Lilongwe",
    primaryLabel: "Post a job", secondaryLabel: "Browse creatives", rightLabel: "BROWSE BY SKILL",
  },
  creative: {
    bg: "#000000", text: "hsl(43, 33%, 94%)", textMuted: "hsla(43, 33%, 94%, 0.70)",
    accent: "hsl(180, 60%, 55%)", badgeBorder: "rgba(255,255,255,0.15)", badgeBg: "rgba(255,255,255,0.05)",
    primaryBg: "hsl(43, 33%, 94%)", primaryText: "#000000", secondaryBorder: "rgba(255,255,255,0.20)",
    searchBorder: "hsla(43, 33%, 94%, 0.30)", searchBg: "rgba(255,255,255,0.05)", tabBarBg: "rgba(255,255,255,0.06)",
    cityText: "hsla(43, 33%, 94%, 0.50)",
    badge: "Get hired. Get paid. In MWK. \u2726", line1: "Get hired.", line2: "Show your work.", line2Italic: true,
    sub: "Join Malawi's first creative marketplace. Build your portfolio, set your rates, and get paid for what you know how to do.",
    placeholder: "e.g. logo design jobs in Blantyre",
    primaryLabel: "Join as a creative", secondaryLabel: "Browse open jobs", rightLabel: "FIND JOBS BY SKILL",
  },
};

const VALUE_PROPS = [
  { icon: "ShieldCheck", title: "Money is held in escrow", body: "The client funds the job before work starts. We hold it. The creative gets paid when the work is approved \u2014 nobody has to trust a stranger." },
  { icon: "Smartphone", title: "Paid in MWK, to Airtel Money, Mpamba or your bank", body: "No foreign currency, no card required, no waiting on an international transfer. Malawian kwacha, into the account you already use." },
  { icon: "BadgeCheck", title: "Real Malawian creatives", body: "Designers, developers, photographers and writers working in Blantyre, Lilongwe and Mzuzu. Judged on the work they have shipped, not on a certificate." },
  { icon: "Scale", title: "Disputes are handled by a person", body: "If something goes wrong, a human reads both sides and decides. Not a form, not a chatbot, not silence." },
];

const STEPS = {
  client: [["Post what you need", "Describe the work and your budget. It takes a few minutes and costs nothing."],
           ["Pick someone", "Read proposals, look at portfolios, message the ones you like."],
           ["Fund the job", "Pay the agreed price into escrow. The creative can see it is there, and cannot touch it."],
           ["Approve and release", "Happy with the work? Release the money. Not happy? Open a dispute."]],
  creative: [["Build your profile", "Show the work you have already done and set your rates."],
             ["Send proposals", "Reply to jobs that fit. Say what you would do and what it costs."],
             ["Do the work", "The money is already in escrow before you start, so you know it exists."],
             ["Get paid in MWK", "Approved work releases to your Airtel Money, Mpamba or bank account."]],
};

function MarketingHome({ mode, setMode, go }) {
  const { Button, Icon, Badge, CreativeCard, JobCard, FeedCarousel, FeedCard } = DS();
  const t = HERO[mode];
  const D = window.GH_DATA;
  const [stepMode, setStepMode] = React.useState("client");
  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section style={{ position: "relative", width: "100%", overflow: "hidden", background: t.bg, color: t.text, transition: "background-color var(--dur-theme) var(--ease-out), color var(--dur-theme) var(--ease-out)" }}>
        <div style={{ margin: "0 auto", maxWidth: "var(--page-max)", display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 48, padding: "32px var(--gutter-md)" }}>
          <div style={{ paddingTop: 16 }}>
            <span style={{ display: "inline-flex", alignItems: "center", borderRadius: 999, border: "1px solid " + t.badgeBorder, background: t.badgeBg, padding: "2px 12px", fontSize: "var(--text-xs)", fontWeight: 500, color: t.text }}>{t.badge}</span>
            <h1 style={{ margin: "12px 0 0", fontFamily: "var(--font-display)", fontSize: 50, fontWeight: 600, lineHeight: 1.04, letterSpacing: "-0.025em" }}>
              <span style={{ display: "block" }}>{t.line1}</span>
              <span style={{ display: "block", marginTop: 4, fontStyle: t.line2Italic ? "italic" : "normal", color: t.accent }}>{t.line2}</span>
            </h1>
            <p style={{ margin: "12px 0 0", maxWidth: "36rem", fontSize: "var(--text-base)", lineHeight: "var(--leading-relaxed)", color: t.textMuted }}>{t.sub}</p>

            <div style={{ marginTop: 16, maxWidth: 640, display: "grid", gap: 8, justifyItems: "start" }}>
              <div role="tablist" style={{ display: "inline-flex", alignItems: "center", gap: 4, borderRadius: 999, background: t.tabBarBg, padding: 4 }}>
                {[["client", "Briefcase", "I want to hire"], ["creative", "Palette", "I want to find work"]].map(([m, ic, label]) => (
                  <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => setMode(m)}
                    style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 999, border: 0, cursor: "pointer", padding: "6px 16px", fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", fontWeight: 500, background: mode === m ? t.primaryBg : "transparent", color: mode === m ? t.primaryText : t.text, transition: "background-color var(--dur-theme) var(--ease-out), color var(--dur-theme) var(--ease-out)" }}>
                    <Icon name={ic} size={16} />{label}
                  </button>
                ))}
              </div>
              <form onSubmit={(e) => e.preventDefault()} style={{ display: "flex", width: "100%", alignItems: "stretch", borderRadius: "var(--radius-panel)", border: "1px solid " + t.searchBorder, background: t.searchBg, padding: 6 }}>
                <input type="search" placeholder={t.placeholder} aria-label="Search"
                  style={{ minWidth: 0, flex: 1, background: "transparent", border: 0, padding: "12px", fontFamily: "var(--font-body)", fontSize: "var(--text-base)", color: t.text, outline: "none" }} />
                <button type="submit" style={{ display: "flex", height: 44, alignItems: "center", gap: 8, borderRadius: "var(--radius-control)", border: 0, cursor: "pointer", padding: "0 20px", fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", fontWeight: 500, background: t.primaryBg, color: t.primaryText }}>
                  <Icon name="Search" size={16} />Search
                </button>
              </form>
            </div>

            <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
              <a href="#" onClick={(e) => { e.preventDefault(); go(mode === "client" ? "/jobs/new" : "/jobs"); }}
                style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 999, padding: "10px 20px", fontSize: "var(--text-sm)", fontWeight: 500, textDecoration: "none", whiteSpace: "nowrap", background: t.primaryBg, color: t.primaryText }}>
                {t.primaryLabel}<Icon name="ArrowRight" size={16} />
              </a>
              <a href="#" onClick={(e) => { e.preventDefault(); go(mode === "client" ? "/browse" : "/jobs"); }}
                style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 999, border: "1px solid " + t.secondaryBorder, padding: "10px 20px", fontSize: "var(--text-sm)", fontWeight: 500, textDecoration: "none", whiteSpace: "nowrap", color: t.text }}>
                {t.secondaryLabel}
              </a>
            </div>
          </div>

          <div style={{ paddingTop: 24 }}>
            <p style={{ margin: 0, fontSize: "var(--text-xs)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "var(--tracking-caps)", color: t.textMuted }}>{t.rightLabel}</p>
            <ul style={{ margin: "16px 0 0", padding: 0, listStyle: "none", display: "grid", gap: 2 }}>
              {D.categories.slice(0, 6).map((c) => (
                <li key={c}>
                  <a href="#" onClick={(e) => { e.preventDefault(); go("/browse"); }} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid " + t.badgeBorder, padding: "10px 0", fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", textDecoration: "none", color: t.text }}>
                    {c}<Icon name="ArrowRight" size={16} color={t.textMuted} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div style={{ margin: "0 auto", maxWidth: "var(--page-max)", padding: "0 var(--gutter-md) 16px" }}>
          <p style={{ margin: 0, fontSize: "var(--text-xs)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "var(--tracking-city)", color: t.cityText }}>Blantyre &middot; Lilongwe &middot; Mzuzu</p>
        </div>
      </section>

      {/* ── Value props ──────────────────────────────────────── */}
      <section style={{ borderTop: "1px solid var(--gh-ink-10)", borderBottom: "1px solid var(--gh-ink-10)", background: "var(--surface-canvas)", padding: "80px 0" }}>
        <div style={{ margin: "0 auto", maxWidth: "var(--page-max)", padding: "0 var(--gutter-md)" }}>
          <p className="gh-eyebrow" style={{ margin: 0 }}>Why Ganyu Hub</p>
          <h2 style={{ margin: "12px 0 0", maxWidth: "42rem", fontFamily: "var(--font-display)", fontSize: "var(--text-3xl)", fontWeight: 600 }}>
            Hiring someone you found online should not be a leap of faith.
          </h2>
          <ul style={{ margin: "40px 0 0", padding: 0, listStyle: "none", display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: "36px 40px" }}>
            {VALUE_PROPS.map((v) => (
              <li key={v.title}>
                <Icon name={v.icon} size={28} strokeWidth={1.5} color="var(--gh-teal)" />
                <p style={{ margin: "12px 0 0", fontSize: "var(--text-base)", fontWeight: 600 }}>{v.title}</p>
                <p style={{ margin: "6px 0 0", fontSize: "var(--text-sm)", lineHeight: "var(--leading-relaxed)", color: "var(--gh-ink-70)", textWrap: "pretty" }}>{v.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section style={{ padding: "80px 0", background: "var(--surface-band)" }}>
        <div style={{ margin: "0 auto", maxWidth: "var(--page-max)", padding: "0 var(--gutter-md)" }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 16 }}>
            <div>
              <p className="gh-eyebrow" style={{ margin: 0 }}>How it works</p>
              <h2 style={{ margin: "12px 0 0", fontFamily: "var(--font-display)", fontSize: "var(--text-3xl)", fontWeight: 600 }}>Four steps, and the money is never in the dark.</h2>
            </div>
            <div role="tablist" style={{ display: "inline-flex", gap: 4, borderRadius: 999, background: "var(--gh-ink-05)", padding: 4 }}>
              {[["client", "I'm hiring"], ["creative", "I'm working"]].map(([m, l]) => (
                <button key={m} type="button" onClick={() => setStepMode(m)} aria-selected={stepMode === m}
                  style={{ borderRadius: 999, border: 0, cursor: "pointer", padding: "6px 16px", fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", fontWeight: 500, background: stepMode === m ? "var(--gh-teal)" : "transparent", color: stepMode === m ? "#fff" : "var(--gh-ink-70)", transition: "background-color var(--dur-control) var(--ease-out)" }}>{l}</button>
              ))}
            </div>
          </div>
          <ol style={{ margin: "40px 0 0", padding: 0, listStyle: "none", display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 16, counterReset: "s" }}>
            {STEPS[stepMode].map(([title, body], i) => (
              <li key={title} style={{ borderRadius: "var(--radius-inset)", background: "var(--gh-white)", border: "1px solid var(--border-card)", boxShadow: "var(--shadow-panel-soft)", padding: 20 }}>
                <span style={{ display: "inline-flex", height: 28, width: 28, alignItems: "center", justifyContent: "center", borderRadius: 999, background: "var(--gh-teal-10)", fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--gh-teal-dark)" }}>{i + 1}</span>
                <p style={{ margin: "12px 0 0", fontSize: "var(--text-base)", fontWeight: 600 }}>{title}</p>
                <p style={{ margin: "6px 0 0", fontSize: "var(--text-sm)", lineHeight: "var(--leading-relaxed)", color: "var(--gh-ink-70)" }}>{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Proof rails ──────────────────────────────────────── */}
      <section style={{ padding: "80px 0" }}>
        <div style={{ margin: "0 auto", maxWidth: "var(--page-max)", padding: "0 var(--gutter-md)", display: "grid", gap: 48 }}>
          <FeedCarousel eyebrow="Available now" title="Creatives taking work this week" seeAllHref="#" count={D.creatives.length}>
            {D.creatives.map((c) => <FeedCard key={c.name}><CreativeCard {...c} showSave /></FeedCard>)}
          </FeedCarousel>
          <div>
            <p className="gh-eyebrow" style={{ margin: 0 }}>Open jobs</p>
            <h2 style={{ margin: "4px 0 16px", fontSize: "var(--text-lg)", fontWeight: 600 }}>Work posted in the last week</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {D.jobs.slice(0, 2).map((j) => <JobCard key={j.id} {...j} showSave />)}
            </div>
          </div>
        </div>
      </section>

      {/* ── Closing CTA ──────────────────────────────────────── */}
      <section style={{ padding: "0 0 80px" }}>
        <div style={{ margin: "0 auto", maxWidth: "var(--page-max)", padding: "0 var(--gutter-md)" }}>
          <div style={{ borderRadius: "var(--radius-card)", background: "var(--surface-inverse)", color: "var(--text-on-ink)", padding: "48px 40px", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
            <div>
              <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "var(--text-3xl)", fontWeight: 600, color: "var(--gh-ground)" }}>
                Post a job. <i>Pay when it&rsquo;s right.</i>
              </h2>
              <p style={{ margin: "8px 0 0", maxWidth: "48ch", fontSize: "var(--text-sm)", color: "rgba(239,230,206,0.70)" }}>
                It costs nothing to post, and nothing leaves your account until you have picked someone.
              </p>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <a href="#" onClick={(e) => { e.preventDefault(); go("/jobs/new"); }} style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: "var(--radius-control)", background: "var(--gh-teal)", padding: "12px 24px", fontSize: "var(--text-sm)", fontWeight: 500, color: "#fff", textDecoration: "none" }}>
                Post a job<Icon name="ArrowRight" size={16} color="#fff" />
              </a>
              <a href="#" onClick={(e) => { e.preventDefault(); go("/browse"); }} style={{ display: "inline-flex", alignItems: "center", borderRadius: "var(--radius-control)", border: "1px solid rgba(239,230,206,0.20)", padding: "12px 24px", fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--gh-ground)", textDecoration: "none" }}>
                Browse creatives
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

Object.assign(window, { MarketingHome });
