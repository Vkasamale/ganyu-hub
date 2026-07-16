"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Status = "uploading" | "done" | "error";
type Item = {
  key: string;
  previewUrl: string;
  status: Status;
  url?: string;
  error?: string;
};

// Client-side direct-to-Supabase uploader. Sidesteps Vercel's 4.5MB body cap
// and 10-second server-action timeout by uploading each file straight from the
// browser to Storage, then posting only the resulting URLs (as a JSON string)
// to the server action via a hidden input.
export function MultiImagePicker({
  name,
  max = 10,
}: {
  name: string;
  max?: number;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = useRef(createClient()).current;

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
    return () => {
      // ponytail: currentItems captured via closure — safe at unmount time.
      items.forEach((i) => URL.revokeObjectURL(i.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const uploadedUrls = items.filter((i) => i.status === "done").map((i) => i.url!);
  const anyUploading = items.some((i) => i.status === "uploading");
  const errored = items.filter((i) => i.status === "error").length;

  async function handleFiles(list: File[]) {
    if (!userId) return;
    const room = max - items.length;
    const chosen = list.slice(0, room);
    const staged: Item[] = chosen.map((file) => ({
      key: `${Date.now()}_${file.name}_${Math.random().toString(36).slice(2, 7)}`,
      previewUrl: URL.createObjectURL(file),
      status: "uploading",
    }));
    setItems((prev) => [...prev, ...staged]);

    await Promise.all(chosen.map(async (file, i) => {
      const key = staged[i].key;
      try {
        if (!file.type.startsWith("image/")) throw new Error("Not an image");
        if (file.size > 20 * 1024 * 1024) throw new Error("Over 20MB");
        const ext = file.name.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() || "jpg";
        const path = `${userId}/portfolio/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("portfolio")
          .upload(path, file, { contentType: file.type });
        if (upErr) throw new Error(upErr.message);
        const url = supabase.storage.from("portfolio").getPublicUrl(path).data.publicUrl;
        setItems((prev) => prev.map((it) => (it.key === key ? { ...it, status: "done", url } : it)));
      } catch (e: any) {
        setItems((prev) => prev.map((it) => (it.key === key ? { ...it, status: "error", error: e?.message || "Upload failed" } : it)));
      }
    }));
  }

  function remove(key: string) {
    setItems((prev) => {
      const it = prev.find((x) => x.key === key);
      if (it) URL.revokeObjectURL(it.previewUrl);
      // ponytail: not deleting the uploaded object from Storage on remove —
      // orphaned files stay until periodic cleanup. Worth it for atomic UX.
      return prev.filter((x) => x.key !== key);
    });
  }

  return (
    <div className="space-y-3">
      {/* Hidden JSON payload the server action reads via formData.get(name). */}
      <input type="hidden" name={name} value={JSON.stringify(uploadedUrls)} />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={(e) => {
          const chosen = Array.from(e.target.files || []);
          e.target.value = "";
          if (chosen.length) void handleFiles(chosen);
        }}
      />

      {items.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {items.map((it, i) => (
            <div key={it.key} className="relative aspect-square overflow-hidden rounded-md border border-ink/15 bg-wash/40">
              <img src={it.previewUrl} alt="" className="h-full w-full object-cover" />
              {it.status === "uploading" && (
                <div className="absolute inset-0 flex items-center justify-center bg-ink/40">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 animate-spin text-paper" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3" />
                    <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
              )}
              {it.status === "error" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-red-600/85 p-1 text-center text-[10px] leading-tight text-white">
                  <span className="font-medium">Failed</span>
                  <span className="opacity-80">{it.error}</span>
                </div>
              )}
              {i === 0 && it.status === "done" && (
                <span className="absolute left-1 top-1 rounded bg-ink/85 px-1.5 py-0.5 text-[10px] font-medium text-paper">Cover</span>
              )}
              <button
                type="button"
                onClick={() => remove(it.key)}
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

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={items.length >= max || !userId}
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
          {uploadedUrls.length}/{max} uploaded · first image is the cover
        </p>
        {anyUploading && (
          <span className="text-[11px] font-medium text-stamp">
            Uploading… don&apos;t save yet
          </span>
        )}
        {!anyUploading && errored > 0 && (
          <span className="text-[11px] font-medium text-red-600">
            {errored} failed — remove and retry
          </span>
        )}
      </div>
    </div>
  );
}
