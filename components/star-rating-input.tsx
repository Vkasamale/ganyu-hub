"use client";

import { useState } from "react";

export function StarRatingInput({ name, defaultValue = 0 }: { name: string; defaultValue?: number }) {
  const [value, setValue] = useState(defaultValue);
  const [hover, setHover] = useState(0);
  const active = hover || value;

  return (
    <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
      <input type="hidden" name={name} value={value} />
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          aria-label={`${n} star${n === 1 ? "" : "s"}`}
          onClick={() => setValue(n)}
          onMouseEnter={() => setHover(n)}
          className="p-0.5 transition-transform hover:scale-110"
        >
          <svg
            viewBox="0 0 24 24"
            className={`h-7 w-7 ${n <= active ? "fill-amber-400 text-amber-400" : "fill-none text-ink/25"}`}
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
        </button>
      ))}
    </div>
  );
}
