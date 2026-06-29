"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Tab = "creatives" | "jobs";

export function HeroSearch() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("creatives");
  const [q, setQ] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const path = tab === "creatives" ? "/browse" : "/jobs";
    const params = q.trim() ? `?q=${encodeURIComponent(q.trim())}` : "";
    router.push(`${path}${params}`);
  }

  const placeholder =
    tab === "creatives"
      ? "Describe the creative you need. e.g. wedding photographer in Lilongwe"
      : "Describe the job you're looking for. e.g. logo design, brand strategy";

  return (
    <div className="max-w-xl">
      <div role="tablist" className="inline-flex rounded-t-lg border border-b-0 border-ink/20 bg-paper">
        <TabButton active={tab === "creatives"} onClick={() => setTab("creatives")}>Creatives</TabButton>
        <TabButton active={tab === "jobs"} onClick={() => setTab("jobs")}>Jobs</TabButton>
      </div>
      <form
        onSubmit={handleSubmit}
        className="flex items-stretch rounded-r-lg rounded-bl-lg border border-ink/20 bg-paper p-1.5 shadow-[0_2px_0_rgba(26,22,17,0.08)]"
      >
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          aria-label={`Search ${tab}`}
          className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-ink placeholder:text-ink/45 focus:outline-none"
        />
        <button
          type="submit"
          className="flex h-10 w-12 items-center justify-center rounded-md bg-ink text-paper transition-colors hover:bg-stamp"
          aria-label="Search"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" strokeLinecap="round" />
          </svg>
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
          ? "rounded-t-md bg-stamp px-5 py-2 text-sm font-medium text-paper"
          : "px-5 py-2 text-sm font-medium text-ink/60 hover:text-ink"
      }
    >
      {children}
    </button>
  );
}
