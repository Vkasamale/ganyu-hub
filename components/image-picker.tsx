"use client";

import { useEffect, useRef, useState } from "react";
import { GlassUploadButton } from "@/components/glass-upload-button";

export function ImagePicker({
  name,
  currentUrl,
  label = "Choose image",
  shape = "square",
}: {
  name: string;
  currentUrl?: string | null;
  label?: string;
  shape?: "square" | "circle" | "wide";
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const [fileName, setFileName] = useState<string | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const box =
    shape === "wide"
      ? "aspect-video w-full rounded-lg"
      : shape === "circle"
      ? "h-24 w-24 rounded-full"
      : "h-32 w-32 rounded-lg";

  // Wide previews take full width, so stack the button beneath. Square/circle
  // previews stay side-by-side with the button.
  const layout = shape === "wide" ? "flex flex-col items-start gap-3" : "flex items-center gap-4";

  return (
    <div className={layout}>
      <div className={`${box} shrink-0 overflow-hidden border border-ink/15 bg-wash/40`}>
        {preview ? (
          <img src={preview} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink/40">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <input
          ref={ref}
          type="file"
          name={name}
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
            if (f) {
              const url = URL.createObjectURL(f);
              objectUrlRef.current = url;
              setPreview(url);
              setFileName(f.name);
            } else {
              objectUrlRef.current = null;
              setPreview(currentUrl || null);
              setFileName(null);
            }
          }}
        />
        <GlassUploadButton size="sm" onClick={() => ref.current?.click()}>
          {preview ? "Change" : label}
        </GlassUploadButton>
        {fileName && <p className="max-w-[220px] truncate text-[11px] text-ink/55">{fileName}</p>}
        {!fileName && currentUrl && <p className="text-[11px] text-ink/45">Current image</p>}
      </div>
    </div>
  );
}
