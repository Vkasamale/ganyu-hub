function formatSize(n: number | null | undefined) {
  if (!n) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export function MessageAttachment({
  url,
  name,
  type,
  size,
  mine,
}: {
  url: string;
  name: string | null;
  type: string | null;
  size: number | null;
  mine: boolean;
}) {
  const isImage = (type || "").startsWith("image/");
  const label = name || "Attachment";
  const meta = formatSize(size);

  if (isImage) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="mt-1 block">
        <img
          src={url}
          alt={label}
          className="max-h-64 w-auto max-w-full rounded-lg border border-ink/10 bg-paper"
          loading="lazy"
        />
        {meta && <p className={`mt-1 text-[10px] ${mine ? "text-paper/60" : "text-ink/50"}`}>{meta}</p>}
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={
        mine
          ? "mt-1 inline-flex max-w-full items-center gap-2 rounded-lg border border-paper/25 bg-paper/10 px-3 py-2 text-xs text-paper hover:bg-paper/15"
          : "mt-1 inline-flex max-w-full items-center gap-2 rounded-lg border border-ink/15 bg-wash/40 px-3 py-2 text-xs text-ink hover:bg-wash/60"
      }
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {meta && <span className={mine ? "shrink-0 text-paper/60" : "shrink-0 text-ink/50"}>{meta}</span>}
    </a>
  );
}
