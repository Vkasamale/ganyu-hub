"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Tab = "hire" | "work";

export function HeroSearch() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("hire");
  const [q, setQ] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const path = tab === "hire" ? "/browse" : "/jobs";
    const params = q.trim() ? `?q=${encodeURIComponent(q.trim())}` : "";
    router.push(`${path}${params}`);
  }

  const placeholder =
    tab === "hire"
      ? "Search creatives — e.g. wedding photographer in Lilongwe"
      : "Search jobs — e.g. logo design, brand strategy";

  return (
    <div className="w-full max-w-[640px]">
      <div role="tablist" className="inline-flex rounded-t-lg border border-b-0 border-paper/25 bg-ink/40 backdrop-blur">
        <TabButton active={tab === "hire"} onClick={() => setTab("hire")}>I want to hire</TabButton>
        <TabButton active={tab === "work"} onClick={() => setTab("work")}>I want to work</TabButton>
      </div>
      <form
        onSubmit={handleSubmit}
        className="flex items-stretch rounded-r-lg rounded-bl-lg border border-paper/25 bg-paper p-1.5 shadow-[0_8px_28px_rgba(0,0,0,0.35)]"
      >
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          aria-label={`Search ${tab === "hire" ? "creatives" : "jobs"}`}
          className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-ink placeholder:text-ink/45 focus:outline-none md:text-base"
        />
        <button
          type="submit"
          className="flex h-11 items-center gap-2 rounded-md bg-stamp px-4 text-sm font-medium text-paper transition-colors hover:bg-stamp-dark md:px-5"
          aria-label="Search"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" strokeLinecap="round" />
          </svg>
          <span className="hidden md:inline">Search</span>
        </button>
      </form>
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={
        active
          ? "rounded-t-md bg-paper px-5 py-2.5 text-sm font-medium text-ink"
          : "px-5 py-2.5 text-sm font-medium text-paper/70 hover:text-paper"
      }
    >
      {children}
    </button>
  );
}
