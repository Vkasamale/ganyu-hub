// ponytail: native <details>, no state, no client bundle. Works with JS off.
export function Collapsible({
  title,
  summary,
  right,
  defaultOpen = false,
  children,
}: {
  title: string;
  summary?: React.ReactNode;
  right?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details open={defaultOpen} className="group">
      <summary className="flex cursor-pointer list-none items-baseline justify-between gap-3 [&::-webkit-details-marker]:hidden">
        <div className="min-w-0 flex-1">
          <span className="text-sm font-medium text-ink">{title}</span>
          {summary && (
            <span className="ml-2 text-xs text-ink/60 group-open:hidden">{summary}</span>
          )}
        </div>
        {right}
        {/* Chevron points down when collapsed and flips up when open. Text is
            sr-only so the control still announces itself to screen readers. */}
        <span className="sr-only group-open:hidden">Expand</span>
        <span className="sr-only hidden group-open:inline">Collapse</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="h-4 w-4 shrink-0 self-center text-ink/55 transition-transform duration-200 group-open:-rotate-180"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </summary>
      <div className="mt-4">{children}</div>
    </details>
  );
}
