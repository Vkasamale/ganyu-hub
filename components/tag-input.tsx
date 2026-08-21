"use client";

import { useState } from "react";

// Chip/bubble input: type a value, press Enter (or comma) to lock it in as a
// removable chip. Submits one hidden <input name={name}> per tag, so the server
// reads them with formData.getAll(name) — same pattern as CategoryPicker.
export function TagInput({
  name,
  defaultValue = [],
  placeholder,
}: {
  name: string;
  defaultValue?: string[];
  placeholder?: string;
}) {
  const [tags, setTags] = useState<string[]>(defaultValue);
  const [draft, setDraft] = useState("");

  function add(raw: string) {
    const v = raw.trim().replace(/,+$/, "").trim();
    if (!v) return;
    if (tags.some((t) => t.toLowerCase() === v.toLowerCase())) {
      setDraft("");
      return;
    }
    setTags([...tags, v]);
    setDraft("");
  }
  function removeAt(i: number) {
    setTags(tags.filter((_, idx) => idx !== i));
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 rounded-md border border-ink/15 bg-white p-1.5 focus-within:ring-2 focus-within:ring-brand">
        {tags.map((t, i) => (
          <span
            key={t}
            className="inline-flex items-center gap-1 rounded-full border border-stamp bg-stamp px-3 py-1 text-xs font-medium text-paper"
          >
            {t}
            <button
              type="button"
              onClick={() => removeAt(i)}
              aria-label={`Remove ${t}`}
              className="leading-none text-paper/80 hover:text-paper"
            >
              &times;
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add(draft);
            } else if (e.key === "Backspace" && !draft && tags.length) {
              removeAt(tags.length - 1);
            }
          }}
          onBlur={() => add(draft)}
          placeholder={tags.length ? "" : placeholder}
          className="min-w-[8rem] flex-1 bg-transparent px-1 py-1 text-sm text-ink placeholder:text-ink/45 focus:outline-none"
        />
      </div>
      {tags.map((t) => (
        <input key={`h-${t}`} type="hidden" name={name} value={t} />
      ))}
      <p className="mt-1 text-[11px] text-ink/55">Type and press Enter to add each one.</p>
    </div>
  );
}
