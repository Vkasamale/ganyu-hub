"use client";

import { useRef, useState } from "react";

const ACCEPT = [
  "image/*",
  "application/pdf",
  ".doc",
  ".docx",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xls",
  ".xlsx",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
].join(",");

function formatSize(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export function AttachmentPicker() {
  const ref = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<{ name: string; size: number } | null>(null);

  return (
    <>
      <input
        ref={ref}
        type="file"
        name="attachment"
        accept={ACCEPT}
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          setFile(f ? { name: f.name, size: f.size } : null);
        }}
      />
      <button
        type="button"
        onClick={() => ref.current?.click()}
        aria-label="Attach a file"
        title="Attach a file"
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-ink/55 transition-colors hover:bg-wash/60 hover:text-ink"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
          <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
        </svg>
      </button>
      {file && (
        <span className="inline-flex max-w-[220px] items-center gap-1.5 rounded-full bg-wash/80 px-2.5 py-1 text-xs text-ink">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 shrink-0">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
          </svg>
          <span className="truncate">{file.name}</span>
          <span className="shrink-0 text-ink/50">{formatSize(file.size)}</span>
          <button
            type="button"
            aria-label="Remove attachment"
            onClick={() => {
              if (ref.current) ref.current.value = "";
              setFile(null);
            }}
            className="ml-0.5 shrink-0 text-ink/50 hover:text-ink"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="h-3 w-3">
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </svg>
          </button>
        </span>
      )}
    </>
  );
}
