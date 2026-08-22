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
  delivered,
}: {
  url: string;
  name: string | null;
  type: string | null;
  size: number | null;
  mine: boolean;
  /** Screen 08 marks a file that IS the work — "5.1 MB · delivered file" —
   *  so a draft sent in passing is not mistaken for the delivery. */
  delivered?: boolean;
}) {
  const isImage = (type || "").startsWith("image/");
  const label = name || "Attachment";
  const meta = [formatSize(size), delivered ? "delivered file" : null].filter(Boolean).join(" · ");

  if (isImage) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="mt-1 block">
        <img
          src={url}
          alt={label}
          className="max-h-64 w-auto max-w-full rounded-lg border border-ink/10 bg-raised"
          loading="lazy"
        />
        {meta && <p className={`mt-1 text-[10px] ${mine ? "text-paper/60" : "text-ink/50"}`}>{meta}</p>}
      </a>
    );
  }

  // Item 70 (§H1): a file card, not a mystery link. Name, extension and size
  // on the face of it, with View and Save as SEPARATE actions.
  //
  // Why separate: a delivered .ai or .psd cannot be shown in a browser, so a
  // single "open" link either previews or dumps a blank tab, and the creative
  // has no way to say "just give me the file". `download=` is Supabase
  // Storage's own parameter for forcing an attachment disposition on a signed
  // URL; elsewhere the HTML attribute alone still does the job.
  const ext = (label.includes(".") ? label.split(".").pop() : "")?.toUpperCase().slice(0, 4) || "FILE";
  const saveUrl = url.includes("?")
    ? `${url}&download=${encodeURIComponent(label)}`
    : `${url}?download=${encodeURIComponent(label)}`;

  return (
    <div
      className={
        "mt-1 flex max-w-full items-center gap-3 rounded-lg border px-3 py-2 " +
        (mine ? "border-paper/25 bg-paper/10 text-paper" : "border-ink/15 bg-wash/40 text-ink")
      }
    >
      <span
        className={
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-[9px] font-bold tracking-tight " +
          (mine ? "bg-paper/15 text-paper" : "bg-ink/[0.07] text-ink/60")
        }
        aria-hidden
      >
        {ext}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-xs font-medium">{label}</span>
        {meta && (
          <span className={"block text-[10px] " + (mine ? "text-paper/60" : "text-ink/50")}>{meta}</span>
        )}
      </span>

      <span className="flex shrink-0 items-center gap-1 text-xs">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={
            "rounded px-2 py-1 font-medium underline-offset-2 hover:underline " +
            (mine ? "text-paper" : "text-brand-dark")
          }
        >
          View
        </a>
        <a
          href={saveUrl}
          download={label}
          className={
            "rounded px-2 py-1 font-medium underline-offset-2 hover:underline " +
            (mine ? "text-paper/80" : "text-ink/60")
          }
        >
          Save
        </a>
      </span>
    </div>
  );
}
