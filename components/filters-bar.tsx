"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, LayoutGroup } from "framer-motion";
import { CATEGORIES } from "@/lib/types";

type Kind = "creatives" | "jobs";

type Props = {
  kind: Kind;
  action: string;
  q?: string;
  categories?: string[];
  skills?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
};

const SORTS: Record<Kind, { value: string; label: string }[]> = {
  creatives: [
    { value: "newest", label: "Newest" },
    { value: "rate_asc", label: "Lowest rate" },
    { value: "rate_desc", label: "Highest rate" },
  ],
  jobs: [
    { value: "newest", label: "Newest" },
    { value: "budget_desc", label: "Highest budget" },
    { value: "budget_asc", label: "Lowest budget" },
  ],
};

function buildUrl(action: string, params: Record<string, string | string[] | undefined | null>) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (Array.isArray(v)) v.forEach((vv) => vv && sp.append(k, vv));
    else if (v) sp.set(k, String(v));
  });
  const s = sp.toString();
  return s ? `${action}?${s}` : action;
}

export function FiltersBar({ kind, action, q, categories = [], skills, minPrice, maxPrice, sort }: Props) {
  const [open, setOpen] = useState(false);
  const skillList = (skills || "").split(",").map((s) => s.trim()).filter(Boolean);
  const priceLabel = kind === "creatives" ? "Rate (MWK)" : "Budget (MWK)";
  const placeholder =
    kind === "creatives" ? "Search by name, headline, or bio" : "Search jobs by title or brief";
  const sorts = SORTS[kind];

  const activeCount =
    (q ? 1 : 0) + categories.length + skillList.length + (minPrice ? 1 : 0) + (maxPrice ? 1 : 0);

  const base = { q, category: categories, skills, min_price: minPrice, max_price: maxPrice, sort };
  const removeCategoryUrl = (c: string) =>
    buildUrl(action, { ...base, category: categories.filter((x) => x !== c) });
  const removeSkillUrl = (s: string) =>
    buildUrl(action, { ...base, skills: skillList.filter((x) => x !== s).join(",") });
  const removeQUrl = buildUrl(action, { ...base, q: undefined });
  const removeMinUrl = buildUrl(action, { ...base, min_price: undefined });
  const removeMaxUrl = buildUrl(action, { ...base, max_price: undefined });

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="inline-flex items-center gap-2 rounded-lg border border-ink/20 bg-paper px-4 py-2 text-sm font-medium text-ink shadow-[0_1px_0_rgba(26,22,17,0.06)] transition-colors hover:border-ink/40"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <line x1="4" y1="6" x2="12" y2="6" />
            <line x1="18" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="8" y2="12" />
            <line x1="14" y1="12" x2="20" y2="12" />
            <line x1="4" y1="18" x2="16" y2="18" />
            <line x1="20" y1="18" x2="20" y2="18" />
            <circle cx="15" cy="6" r="2" />
            <circle cx="11" cy="12" r="2" />
            <circle cx="18" cy="18" r="2" />
          </svg>
          Filters
          {activeCount > 0 && (
            <span className="rounded-full bg-stamp px-2 py-0.5 text-[10px] font-semibold text-paper">{activeCount}</span>
          )}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        <form action={action} method="get" className="ml-auto flex items-center gap-2">
          {q && <input type="hidden" name="q" value={q} />}
          {categories.map((c) => <input key={c} type="hidden" name="category" value={c} />)}
          {skills && <input type="hidden" name="skills" value={skills} />}
          {minPrice && <input type="hidden" name="min_price" value={minPrice} />}
          {maxPrice && <input type="hidden" name="max_price" value={maxPrice} />}
          <label htmlFor="sort" className="text-xs uppercase tracking-wider text-ink/55">Sort</label>
          <select
            id="sort"
            name="sort"
            defaultValue={sort || "newest"}
            onChange={(e) => e.currentTarget.form?.submit()}
            className="h-9 rounded-lg border border-ink/20 bg-paper px-3 text-sm text-ink focus:border-ink/40 focus:outline-none"
          >
            {sorts.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </form>
      </div>

      {activeCount > 0 && (
        <LayoutGroup id="filter-chips">
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {q && <Chip id="q" label={`"${q}"`} href={removeQUrl} />}
            {categories.map((c) => <Chip key={`c-${c}`} id={`c-${c}`} label={c} href={removeCategoryUrl(c)} />)}
            {skillList.map((s) => <Chip key={`s-${s}`} id={`s-${s}`} label={s} href={removeSkillUrl(s)} />)}
            {minPrice && <Chip id="min" label={`Min MK ${Number(minPrice).toLocaleString()}`} href={removeMinUrl} />}
            {maxPrice && <Chip id="max" label={`Max MK ${Number(maxPrice).toLocaleString()}`} href={removeMaxUrl} />}
            <Link href={action} className="text-xs font-medium text-stamp underline decoration-stamp/40 underline-offset-4 hover:decoration-stamp">
              Clear all
            </Link>
          </div>
        </LayoutGroup>
      )}

      <div
        className={`grid transition-[grid-template-rows] duration-200 ease-out ${open ? "mt-3 grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <form action={action} method="get" className="rounded-xl border border-ink/15 bg-paper p-5 shadow-[0_2px_8px_rgba(26,22,17,0.05)]">
            <input type="hidden" name="sort" value={sort || "newest"} />

            <div className="space-y-5">
              <div>
                <label htmlFor="q" className="text-xs font-semibold uppercase tracking-wider text-ink/70">Search</label>
                <input
                  id="q"
                  name="q"
                  defaultValue={q || ""}
                  placeholder={placeholder}
                  className="mt-2 h-10 w-full rounded-lg border border-ink/20 bg-paper px-3 text-sm text-ink placeholder:text-ink/40 focus:border-ink/40 focus:outline-none"
                />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink/70">Category</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => {
                    const checked = categories.includes(c);
                    return (
                      <label
                        key={c}
                        className="relative cursor-pointer rounded-full border border-ink/25 bg-paper px-3.5 py-1.5 text-xs font-medium text-ink/80 transition-colors hover:border-ink/50 hover:bg-wash/40 has-[:checked]:border-stamp has-[:checked]:bg-stamp has-[:checked]:text-paper has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-stamp"
                      >
                        <input type="checkbox" name="category" value={c} defaultChecked={checked} className="sr-only" />
                        {c}
                      </label>
                    );
                  })}
                </div>
              </div>

              {kind === "creatives" && (
                <div>
                  <label htmlFor="skills" className="text-xs font-semibold uppercase tracking-wider text-ink/70">
                    Skills <span className="font-normal normal-case text-ink/45">(comma-separated)</span>
                  </label>
                  <input
                    id="skills"
                    name="skills"
                    defaultValue={skills || ""}
                    placeholder="Figma, React, Branding"
                    className="mt-2 h-10 w-full rounded-lg border border-ink/20 bg-paper px-3 text-sm text-ink placeholder:text-ink/40 focus:border-ink/40 focus:outline-none"
                  />
                </div>
              )}

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink/70">{priceLabel}</p>
                <div className="mt-2 flex gap-2">
                  <input
                    name="min_price"
                    type="number"
                    min={0}
                    defaultValue={minPrice || ""}
                    placeholder="Min"
                    className="h-10 w-full rounded-lg border border-ink/20 bg-paper px-3 text-sm text-ink placeholder:text-ink/40 focus:border-ink/40 focus:outline-none"
                  />
                  <input
                    name="max_price"
                    type="number"
                    min={0}
                    defaultValue={maxPrice || ""}
                    placeholder="Max"
                    className="h-10 w-full rounded-lg border border-ink/20 bg-paper px-3 text-sm text-ink placeholder:text-ink/40 focus:border-ink/40 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-ink/10 pt-4">
              <Link href={action} className="text-xs font-medium text-ink/60 underline decoration-ink/30 underline-offset-4 hover:text-ink">
                Clear all
              </Link>
              <button
                type="submit"
                className="rounded-lg bg-stamp px-5 py-2 text-sm font-medium text-paper transition-colors hover:bg-stamp-dark"
              >
                Apply filters
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function Chip({ id, label, href }: { id: string; label: string; href: string }) {
  return (
    <motion.div
      layout
      layoutId={`chip-${id}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <Link
        href={href}
        className="group inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1 text-xs font-medium text-paper transition-colors hover:bg-stamp"
      >
        <span>{label}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="h-3 w-3 opacity-70 group-hover:opacity-100">
          <line x1="6" y1="6" x2="18" y2="18" />
          <line x1="18" y1="6" x2="6" y2="18" />
        </svg>
      </Link>
    </motion.div>
  );
}
