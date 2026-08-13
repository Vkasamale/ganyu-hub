import Link from "next/link";
import { ArrowRight, HandCoins, Scale, ShieldCheck } from "lucide-react";
import { getSessionRole } from "@/lib/require-role";

/**
 * Phase 7 items 62 + 63 (§J3) — the band above the footer.
 *
 * §J3's point: the bottom of a page is where people arrive having failed to
 * find what they wanted, and ours offered them a wall of links and nothing to
 * DO. Two bands: a way back in, then the reason to trust us.
 *
 * The cards are role-aware because "post a job" is the wrong ask for a
 * creative who has just scrolled a jobs list. Role comes from the cached
 * getSessionRole(), so this adds no query to any page that already checked.
 *
 * The trust cards are deliberately the LAST thing before the footer. Escrow is
 * the answer to "why would I send money to a stranger on the internet", which
 * is the question someone is asking at exactly this point on the page.
 */
export async function PreFooter() {
  const { role } = await getSessionRole();
  const signedIn = role !== null;
  const sellsWork = role === "creative" || role === "agency";

  const ways = signedIn
    ? sellsWork
      ? [
          { href: "/jobs", title: "Find work to bid on", body: "Open jobs in the categories you work in." },
          { href: "/jobs/new-for-client", title: "Bring your own client", body: "Agreed a job offline? Set it up and send them a link to pay into escrow." },
          { href: "/browse", title: "See other creatives", body: "How others price and present their work." },
        ]
      : [
          { href: "/jobs/new", title: "Post a job", body: "Describe what you need and creatives come to you. Posting is free." },
          { href: "/browse", title: "Browse creatives", body: "Work, prices and reviews before you talk to anyone." },
          { href: "/dashboard/jobs", title: "Your jobs", body: "Pick up where you left off." },
        ]
    : [
        { href: "/jobs/new", title: "Post a job", body: "Describe what you need and creatives come to you. Posting is free." },
        { href: "/browse", title: "Browse creatives", body: "Work, prices and reviews before you talk to anyone." },
        { href: "/signup", title: "Join as a creative", body: "List what you do, set your prices, get found." },
      ];

  const trust = [
    {
      icon: <ShieldCheck className="h-5 w-5" aria-hidden />,
      title: "The money is held, not sent",
      body: "A client pays into escrow before work starts. The creative can see it is funded; the client keeps it until they approve.",
    },
    {
      icon: <Scale className="h-5 w-5" aria-hidden />,
      title: "If it goes wrong, someone looks",
      body: "Either side can raise a dispute. A human reads it before any money moves.",
    },
    {
      icon: <HandCoins className="h-5 w-5" aria-hidden />,
      title: "Every fee written down",
      body: "What the client pays, what the creative keeps, and who charges what.",
      href: "/how-money-works",
      cta: "How the money works",
    },
  ];

  return (
    <section className="border-t border-ink/[0.07] bg-wash/40">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
        <div className="grid gap-3 sm:grid-cols-3">
          {ways.map((w) => (
            <Link
              key={w.href}
              href={w.href}
              className="group flex flex-col rounded-xl border border-ink/10 bg-paper p-5 transition-colors hover:border-brand/40"
            >
              <p className="font-medium text-ink">{w.title}</p>
              <p className="mt-1 flex-1 text-sm leading-relaxed text-ink/65">{w.body}</p>
              <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-brand-dark">
                Go
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {trust.map((t) => (
            <div key={t.title}>
              <span className="text-brand-dark">{t.icon}</span>
              <p className="mt-2 text-sm font-semibold text-ink">{t.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-ink/65">{t.body}</p>
              {t.href && (
                <Link
                  href={t.href}
                  className="mt-1.5 inline-block text-sm font-medium text-brand-dark hover:underline"
                >
                  {t.cta}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
