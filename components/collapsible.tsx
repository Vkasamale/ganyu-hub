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
        <span className="shrink-0 text-xs text-ink/55 underline underline-offset-2">
          <span className="group-open:hidden">See more</span>
          <span className="hidden group-open:inline">Hide</span>
        </span>
      </summary>
      <div className="mt-4">{children}</div>
    </details>
  );
}
