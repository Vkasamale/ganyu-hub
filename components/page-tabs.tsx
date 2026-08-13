import Link from "next/link";

/**
 * Item 59 (§A) — sub-tabs under a page title.
 *
 * Four pages had invented four different tab treatments: Saved used dark
 * pills, Jobs another, Proposals another, Admin another. Same idea, four
 * answers, so nothing about the app taught you what a tab looks like.
 *
 * Underline rather than filled pills: a filled dark pill reads as a BUTTON —
 * something that acts — where a tab only changes what you are looking at.
 *
 * Counts are optional and omitted at zero rather than shown as "0" (§Q7); a
 * tab reading 0 is a tab you have already been told not to press.
 */
export type PageTab = {
  key: string;
  label: string;
  href: string;
  count?: number | null;
};

export function PageTabs({
  tabs,
  active,
  className = "",
}: {
  tabs: PageTab[];
  active: string;
  className?: string;
}) {
  return (
    <nav
      aria-label="Sections"
      className={
        "-mb-px flex gap-1 overflow-x-auto border-b border-ink/10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden " +
        className
      }
    >
      {tabs.map((t) => {
        const on = t.key === active;
        return (
          <Link
            key={t.key}
            href={t.href}
            scroll={false}
            aria-current={on ? "page" : undefined}
            className={
              "whitespace-nowrap border-b-2 px-3 py-2.5 text-sm transition-colors " +
              (on
                ? "border-brand font-medium text-ink"
                : "border-transparent text-ink/60 hover:border-ink/20 hover:text-ink")
            }
          >
            {t.label}
            {typeof t.count === "number" && t.count > 0 && (
              <span className={"ml-1.5 text-xs " + (on ? "text-ink/55" : "text-ink/40")}>
                {t.count}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
