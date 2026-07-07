"use client";

import { useState } from "react";
import { CATEGORIES } from "@/lib/types";

// Searchable, scrollable category chip picker. Same UI in three places:
// - profile / onboarding (name="categories", server reads formData.getAll)
// - browse & jobs filters (name="category", GET query)
// Native checkboxes so multi-select works without extra state.
export function CategoryPicker({
  selected = [],
  name = "categories",
}: {
  selected?: string[];
  name?: string;
}) {
  const [q, setQ] = useState("");
  const set = new Set(selected);
  const needle = q.trim().toLowerCase();
  const filtered = needle
    ? CATEGORIES.filter((c) => c.toLowerCase().includes(needle))
    : CATEGORIES;

  return (
    <div className="space-y-2">
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={`Search ${CATEGORIES.length} categories…`}
        className="h-9 w-full rounded-lg border border-ink/20 bg-paper px-3 text-sm text-ink placeholder:text-ink/40 focus:border-ink/40 focus:outline-none"
      />
      {/* Keep any selected-but-filtered-out chips in the form so they're not silently dropped on submit. */}
      {selected
        .filter((c) => !(filtered as readonly string[]).includes(c))
        .map((c) => (
          <input key={`hidden-${c}`} type="hidden" name={name} value={c} />
        ))}
      <div className="max-h-52 overflow-y-auto rounded-lg border border-ink/10 bg-wash/20 p-2">
        <div className="flex flex-wrap gap-2">
          {filtered.map((c) => (
            <label
              key={c}
              className="relative cursor-pointer rounded-full border border-ink/25 bg-paper px-3.5 py-1.5 text-xs font-medium text-ink/80 transition-colors hover:border-ink/50 hover:bg-wash/40 has-[:checked]:border-stamp has-[:checked]:bg-stamp has-[:checked]:text-paper has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-stamp"
            >
              <input
                type="checkbox"
                name={name}
                value={c}
                defaultChecked={set.has(c)}
                className="sr-only"
              />
              {c}
            </label>
          ))}
          {filtered.length === 0 && (
            <p className="w-full py-2 text-center text-xs text-ink/50">
              No categories match &ldquo;{q}&rdquo;.
            </p>
          )}
        </div>
      </div>
      {selected.length > 0 && (
        <p className="text-[11px] text-ink/55">{selected.length} selected</p>
      )}
    </div>
  );
}
