"use client";

import { useEffect, useRef, useState } from "react";

type Item = { file: File; url: string };

export function MultiImagePicker({
  name,
  max = 10,
}: {
  name: string;
  max?: number;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    return () => {
      items.forEach((i) => URL.revokeObjectURL(i.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const syncInput = (next: Item[]) => {
    if (!ref.current) return;
    const dt = new DataTransfer();
    next.forEach((i) => dt.items.add(i.file));
    ref.current.files = dt.files;
  };

  const remove = (idx: number) => {
    setItems((prev) => {
      URL.revokeObjectURL(prev[idx].url);
      const next = prev.filter((_, i) => i !== idx);
      syncInput(next);
      return next;
    });
  };

  return (
    <div className="space-y-3">
      <input
        ref={ref}
        type="file"
        name={name}
        accept="image/*"
        multiple
        className="sr-only"
        onChange={(e) => {
          const chosen = Array.from(e.target.files || []);
          const next = [
            ...items,
            ...chosen.slice(0, max - items.length).map((file) => ({
              file,
              url: URL.createObjectURL(file),
            })),
          ];
          syncInput(next);
          setItems(next);
        }}
      />

      {items.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {items.map((it, i) => (
            <div key={it.url} className="relative aspect-square overflow-hidden rounded-md border border-ink/15 bg-wash/40">
              <img src={it.url} alt="" className="h-full w-full object-cover" />
              {i === 0 && (
                <span className="absolute left-1 top-1 rounded bg-ink/85 px-1.5 py-0.5 text-[10px] font-medium text-paper">Cover</span>
              )}
              <button
                type="button"
                onClick={() => remove(i)}
                aria-label="Remove image"
                className="absolute right-1 top-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-ink/85 text-paper hover:bg-ink"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="h-3 w-3">
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="18" y1="6" x2="6" y2="18" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => ref.current?.click()}
          disabled={items.length >= max}
          className="inline-flex items-center gap-2 rounded-md border border-ink/20 bg-paper px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:border-ink/40 disabled:opacity-50"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          {items.length === 0 ? "Upload images" : "Add more"}
        </button>
        <p className="text-[11px] text-ink/50">
          {items.length}/{max} · first image is the cover
        </p>
      </div>
    </div>
  );
}
