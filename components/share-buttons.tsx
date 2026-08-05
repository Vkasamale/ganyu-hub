"use client";
import { useEffect, useState } from "react";

// Reusable social-share row. Renders WhatsApp / X / Facebook / Instagram / native
// "Share" / copy. `url` may be a relative path ("/creatives/123") or absolute; if
// omitted it defaults to the current page URL. Instagram has no web link-share
// intent, so that button copies the link and tells the user to paste it — the
// native Share button (mobile) is the real path to IG stories/DMs.
export function ShareButtons({
  url,
  title = "Ganyu Hub",
  text,
  className = "",
  label = "Share",
}: {
  url?: string;
  title?: string;
  text?: string;
  className?: string;
  label?: string;
}) {
  const [href, setHref] = useState(url && /^https?:\/\//.test(url) ? url : "");
  const [canNativeShare, setCanNativeShare] = useState(false);
  const [flash, setFlash] = useState("");

  useEffect(() => {
    // Resolve relative/omitted URLs against the live origin once mounted.
    const origin = window.location.origin;
    const resolved = url
      ? /^https?:\/\//.test(url) ? url : `${origin}${url.startsWith("/") ? "" : "/"}${url}`
      : window.location.href;
    setHref(resolved);
    setCanNativeShare(typeof navigator !== "undefined" && !!navigator.share);
  }, [url]);

  const msg = text || title;
  const e = encodeURIComponent;
  const links = {
    whatsapp: `https://wa.me/?text=${e(`${msg} ${href}`)}`,
    x: `https://twitter.com/intent/tweet?url=${e(href)}&text=${e(msg)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${e(href)}`,
  };

  async function copy(hint?: string) {
    try {
      await navigator.clipboard.writeText(href);
      setFlash(hint || "Link copied!");
    } catch {
      setFlash("Couldn't copy — long-press to copy.");
    }
    setTimeout(() => setFlash(""), 2500);
  }

  async function nativeShare() {
    try {
      await navigator.share({ title, text: msg, url: href });
    } catch {
      /* user cancelled — ignore */
    }
  }

  const cls =
    "inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink/10 bg-white text-ink/70 transition-colors hover:bg-ink/5 hover:text-ink";

  return (
    <div className={`flex items-center gap-1.5 ${className}`} aria-label={label}>
      {canNativeShare && (
        <button type="button" onClick={nativeShare} className={cls} title={label} aria-label={label}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
        </button>
      )}
      <a href={links.whatsapp} target="_blank" rel="noopener noreferrer" className={cls} title="Share on WhatsApp" aria-label="Share on WhatsApp">
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413" />
        </svg>
      </a>
      <a href={links.x} target="_blank" rel="noopener noreferrer" className={cls} title="Share on X" aria-label="Share on X">
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </a>
      <a href={links.facebook} target="_blank" rel="noopener noreferrer" className={cls} title="Share on Facebook" aria-label="Share on Facebook">
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      </a>
      <button
        type="button"
        onClick={() => copy("Link copied — paste it into your Instagram story or DM")}
        className={cls}
        title="Share on Instagram"
        aria-label="Share on Instagram (copies link)"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      </button>
      <button type="button" onClick={() => copy()} className={cls} title="Copy link" aria-label="Copy link">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      </button>
      {flash && <span className="text-xs text-ink/60">{flash}</span>}
    </div>
  );
}
