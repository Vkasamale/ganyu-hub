import Link from "next/link";

/**
 * Item 53 (§N6, §K3) — the search scope selector.
 *
 * Two surfaces search two different things and nothing said so. Someone typing
 * "logo" into /jobs is looking for work; someone typing it into /browse is
 * looking for a person. Get it the wrong way round and the honest result is
 * zero, which reads as "this platform has nothing" rather than "you are on the
 * wrong page".
 *
 * §K3 asks for a sentence on each, not two bare tabs — "Creatives" and "Jobs"
 * mean nothing on a first visit. The sentence is the feature.
 *
 * The query carries across, so switching scope re-runs the same search rather
 * than making anyone type it again.
 */
export function SearchScope({ current, q }: { current: "creatives" | "jobs"; q?: string }) {
  const query = q ? `?q=${encodeURIComponent(q)}` : "";

  const options = [
    {
      key: "creatives" as const,
      href: `/browse${query}`,
      label: "Find someone to hire",
      sentence: "Search people — their work, prices and reviews.",
    },
    {
      key: "jobs" as const,
      href: `/jobs${query}`,
      label: "Find work to do",
      sentence: "Search jobs clients have posted, with budgets.",
    },
  ];

  return (
    <div className="grid gap-2 sm:grid-cols-2" role="group" aria-label="What are you searching for?">
      {options.map((o) => {
        const on = o.key === current;
        return (
          <Link
            key={o.key}
            href={o.href}
            aria-current={on ? "page" : undefined}
            className={
              "rounded-lg border px-4 py-3 transition-colors " +
              (on ? "border-stamp bg-stamp/[0.06]" : "border-ink/15 bg-paper hover:border-ink/30")
            }
          >
            <p className={"text-sm font-semibold " + (on ? "text-stamp-dark" : "text-ink")}>
              {o.label}
            </p>
            <p className="mt-0.5 text-xs text-ink/60">{o.sentence}</p>
          </Link>
        );
      })}
    </div>
  );
}
