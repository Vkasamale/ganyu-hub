"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Briefcase, Palette, Search, ArrowRight } from "lucide-react";
import { CATEGORIES } from "@/lib/types";

type Mode = "client" | "creative";

const THEME: Record<Mode, {
  bg: string;
  text: string;
  textMuted: string;
  accent: string;
  badgeBorder: string;
  badgeBg: string;
  badgeText: string;
  primaryBg: string;
  primaryText: string;
  secondaryBorder: string;
  secondaryText: string;
  searchBorder: string;
  searchBg: string;
  searchText: string;
  tabBarBg: string;
  catLinkText: string;
  catLinkHover: string;
  cityText: string;
}> = {
  client: {
    bg: "hsl(43, 33%, 94%)",
    text: "hsl(0, 14%, 17%)",
    textMuted: "hsla(0, 14%, 17%, 0.70)",
    accent: "hsl(0, 63%, 33%)",
    badgeBorder: "rgba(0,0,0,0.10)",
    badgeBg: "rgba(255,255,255,0.60)",
    badgeText: "hsl(0, 14%, 17%)",
    primaryBg: "hsl(0, 63%, 33%)",
    primaryText: "#FFFFFF",
    secondaryBorder: "rgba(0,0,0,0.15)",
    secondaryText: "hsl(0, 14%, 17%)",
    searchBorder: "hsla(0, 63%, 33%, 0.30)",
    searchBg: "#FFFFFF",
    searchText: "hsl(0, 14%, 17%)",
    tabBarBg: "rgba(0,0,0,0.05)",
    catLinkText: "hsl(0, 14%, 17%)",
    catLinkHover: "hsl(0, 63%, 33%)",
    cityText: "hsla(0, 14%, 17%, 0.65)",
  },
  creative: {
    bg: "#000000",
    text: "hsl(43, 33%, 94%)",
    textMuted: "hsla(43, 33%, 94%, 0.70)",
    accent: "hsl(0, 78%, 62%)",
    badgeBorder: "rgba(255,255,255,0.15)",
    badgeBg: "rgba(255,255,255,0.05)",
    badgeText: "hsl(43, 33%, 94%)",
    primaryBg: "hsl(43, 33%, 94%)",
    primaryText: "#000000",
    secondaryBorder: "rgba(255,255,255,0.20)",
    secondaryText: "hsl(43, 33%, 94%)",
    searchBorder: "hsla(43, 33%, 94%, 0.30)",
    searchBg: "rgba(255,255,255,0.05)",
    searchText: "hsl(43, 33%, 94%)",
    tabBarBg: "rgba(255,255,255,0.06)",
    catLinkText: "hsl(43, 33%, 94%)",
    catLinkHover: "hsl(0, 78%, 62%)",
    cityText: "hsla(43, 33%, 94%, 0.50)",
  },
};

const CONTENT: Record<Mode, {
  badge: string;
  line1: string;
  line2: string;
  sub: string;
  placeholder: string;
  searchTab: "creatives" | "jobs";
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
  rightLabel: string;
  catHrefPrefix: string;
}> = {
  client: {
    badge: "Malawi's creative marketplace ✦",
    line1: "Hire",
    line2: "Malawian creatives.",
    sub: "A working press for designers, developers, photographers, and writers across Lilongwe, Blantyre, and Mzuzu.",
    placeholder: "e.g. wedding photographer in Lilongwe",
    searchTab: "creatives",
    primaryLabel: "Post a job",
    primaryHref: "/jobs/new",
    secondaryLabel: "Browse creatives",
    secondaryHref: "/browse",
    rightLabel: "BROWSE BY SKILL",
    catHrefPrefix: "/browse?category=",
  },
  creative: {
    badge: "Get hired. Get paid. In MWK. ✦",
    line1: "Get hired.",
    line2: "Show your work.",
    sub: "Join Malawi's first creative marketplace. Build your portfolio, set your rates, and get paid for what you know how to do.",
    placeholder: "e.g. logo design jobs in Blantyre",
    searchTab: "jobs",
    primaryLabel: "Join as a creative",
    primaryHref: "/signup?role=creative",
    secondaryLabel: "Browse open jobs",
    secondaryHref: "/jobs",
    rightLabel: "FIND JOBS BY SKILL",
    catHrefPrefix: "/jobs?category=",
  },
};

export default function Home() {
  const [mode, setMode] = useState<Mode>("client");
  const t = THEME[mode];
  const c = CONTENT[mode];

  useEffect(() => {
    const saved = typeof window !== "undefined" ? (localStorage.getItem("ganyu_mode") as Mode | null) : null;
    if (saved === "client" || saved === "creative") setMode(saved);
  }, []);
  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem("ganyu_mode", mode);
  }, [mode]);

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        backgroundColor: t.bg,
        color: t.text,
        transition: "background-color 500ms ease-in-out, color 500ms ease-in-out",
      }}
    >
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:grid-cols-[1.6fr_1fr] md:gap-12 md:px-8 md:py-8">
        <div>
          <ModeToggle mode={mode} setMode={setMode} t={t} />

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } }}
              exit={{ opacity: 0, y: 4, transition: { duration: 0.2, ease: "easeIn" } }}
              className="mt-4"
            >
              <span
                className="inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-medium"
                style={{
                  borderColor: t.badgeBorder,
                  backgroundColor: t.badgeBg,
                  color: t.badgeText,
                  transition: "background-color 500ms ease-in-out, border-color 500ms ease-in-out, color 500ms ease-in-out",
                }}
              >
                {c.badge}
              </span>

              <h1 className="mt-3 text-4xl font-semibold leading-[0.95] tracking-tight md:text-5xl lg:text-6xl">
                <span className="block" style={{ color: t.text, transition: "color 500ms ease-in-out" }}>
                  {c.line1}
                </span>
                <em
                  className="mt-1 block cursor-default transition-[letter-spacing,transform] duration-300 ease-out hover:tracking-wide hover:-translate-y-0.5"
                  style={{
                    fontStyle: "italic",
                    color: t.accent,
                    transition: "color 500ms ease-in-out, letter-spacing 300ms ease-out, transform 300ms ease-out",
                  }}
                >
                  {c.line2}
                </em>
              </h1>

              <p
                className="mt-3 max-w-xl text-sm leading-relaxed md:text-base"
                style={{ color: t.textMuted, transition: "color 500ms ease-in-out" }}
              >
                {c.sub}
              </p>

              <div className="mt-4 max-w-[640px]">
                <SearchBar mode={mode} t={t} c={c} />
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <Link
                  href={c.primaryHref}
                  className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium"
                  style={{
                    backgroundColor: t.primaryBg,
                    color: t.primaryText,
                    transition: "background-color 500ms ease-in-out, color 500ms ease-in-out",
                  }}
                >
                  {c.primaryLabel}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href={c.secondaryHref}
                  className="inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium"
                  style={{
                    borderColor: t.secondaryBorder,
                    color: t.secondaryText,
                    transition: "border-color 500ms ease-in-out, color 500ms ease-in-out",
                  }}
                >
                  {c.secondaryLabel}
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="md:pt-6">
          <p
            className="text-xs font-medium uppercase tracking-[0.22em]"
            style={{ color: t.textMuted, transition: "color 500ms ease-in-out" }}
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={c.rightLabel}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.3 } }}
                exit={{ opacity: 0, y: 4, transition: { duration: 0.2 } }}
                className="inline-block"
              >
                {c.rightLabel}
              </motion.span>
            </AnimatePresence>
          </p>
          <ul className="mt-2 space-y-0">
            {CATEGORIES.map((cat) => (
              <li key={cat}>
                <CategoryLink href={`${c.catHrefPrefix}${encodeURIComponent(cat)}`} t={t}>
                  {cat}
                </CategoryLink>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-4 md:px-8">
        <p
          className="text-xs font-medium uppercase tracking-[0.32em]"
          style={{ color: t.cityText, transition: "color 500ms ease-in-out" }}
        >
          Blantyre · Lilongwe · Mzuzu
        </p>
      </div>
    </section>
  );
}

function ModeToggle({ mode, setMode, t }: { mode: Mode; setMode: (m: Mode) => void; t: typeof THEME[Mode] }) {
  return (
    <div
      className="inline-flex items-center gap-1 rounded-full p-1"
      style={{
        backgroundColor: t.tabBarBg,
        transition: "background-color 500ms ease-in-out",
      }}
      role="tablist"
    >
      <TabPill active={mode === "client"} onClick={() => setMode("client")} t={t} icon={<Briefcase className="h-4 w-4" />}>
        I want to hire
      </TabPill>
      <TabPill active={mode === "creative"} onClick={() => setMode("creative")} t={t} icon={<Palette className="h-4 w-4" />}>
        I want to find work
      </TabPill>
    </div>
  );
}

function TabPill({
  active, onClick, t, icon, children,
}: { active: boolean; onClick: () => void; t: typeof THEME[Mode]; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium"
      style={{
        backgroundColor: active ? t.primaryBg : "transparent",
        color: active ? t.primaryText : t.text,
        transition: "background-color 500ms ease-in-out, color 500ms ease-in-out",
      }}
    >
      {icon}
      {children}
    </button>
  );
}

function SearchBar({ mode, t, c }: { mode: Mode; t: typeof THEME[Mode]; c: typeof CONTENT[Mode] }) {
  const router = useRouter();
  const [tab, setTab] = useState<"creatives" | "jobs">(c.searchTab);
  const [q, setQ] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const path = tab === "creatives" ? "/browse" : "/jobs";
    const params = q.trim() ? `?q=${encodeURIComponent(q.trim())}` : "";
    router.push(`${path}${params}`);
  }

  const isCreativesActive = tab === "creatives";

  return (
    <div className="w-full">
      <div
        role="tablist"
        className="inline-flex rounded-t-lg border border-b-0 px-1 pt-1"
        style={{
          borderColor: t.searchBorder,
          backgroundColor: t.searchBg,
          transition: "border-color 500ms ease-in-out, background-color 500ms ease-in-out",
        }}
      >
        <SearchTab active={isCreativesActive} onClick={() => setTab("creatives")} t={t}>
          Creatives
        </SearchTab>
        <SearchTab active={!isCreativesActive} onClick={() => setTab("jobs")} t={t}>
          Jobs
        </SearchTab>
      </div>
      <form
        onSubmit={submit}
        className="flex items-stretch rounded-r-lg rounded-bl-lg border p-1.5"
        style={{
          borderColor: t.searchBorder,
          backgroundColor: t.searchBg,
          transition: "border-color 500ms ease-in-out, background-color 500ms ease-in-out",
        }}
      >
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={c.placeholder}
          aria-label="Search"
          className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm focus:outline-none md:text-base"
          style={{ color: t.searchText, transition: "color 500ms ease-in-out" }}
        />
        <button
          type="submit"
          className="flex h-11 items-center gap-2 rounded-md px-4 text-sm font-medium md:px-5"
          style={{
            backgroundColor: t.primaryBg,
            color: t.primaryText,
            transition: "background-color 500ms ease-in-out, color 500ms ease-in-out",
          }}
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
          <span className="hidden md:inline">Search</span>
        </button>
      </form>
    </div>
  );
}

function SearchTab({ active, onClick, t, children }: { active: boolean; onClick: () => void; t: typeof THEME[Mode]; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className="rounded-t-md px-4 py-1.5 text-xs font-medium"
      style={{
        backgroundColor: active ? t.primaryBg : "transparent",
        color: active ? t.primaryText : t.text,
        transition: "background-color 500ms ease-in-out, color 500ms ease-in-out",
      }}
    >
      {children}
    </button>
  );
}

function CategoryLink({ href, t, children }: { href: string; t: typeof THEME[Mode]; children: React.ReactNode }) {
  const [hover, setHover] = useState(false);
  return (
    <Link
      href={href}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="group flex items-center justify-between gap-3 border-b py-2 text-base font-medium md:text-lg"
      style={{
        color: hover ? t.catLinkHover : t.catLinkText,
        borderColor: t.secondaryBorder,
        transition: "color 250ms ease-out, border-color 500ms ease-in-out",
      }}
    >
      <span>{children}</span>
      <ArrowRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
    </Link>
  );
}
