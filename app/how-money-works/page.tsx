import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/supabase/user";
import { MoneyCalculator } from "@/components/money-calculator";
import {
  BETA_ZERO_COMMISSION,
  PLATFORM_COMMISSION,
  MIN_PAYOUT_MWK,
  COLLECTION_RATE,
  PAYOUT_RATE,
} from "@/lib/fees";
import { formatMwk } from "@/lib/utils";

export const metadata: Metadata = {
  title: "How the money works — Ganyu Hub",
  description:
    "Escrow, fees and payouts on Ganyu Hub, explained in plain terms — with a live calculator.",
};

const STEPS = [
  {
    n: "1",
    title: "You agree a price",
    body: "The creative's bid is the price of the work. No hidden markup gets added to it later — what you both agree is what the job is worth.",
  },
  {
    n: "2",
    title: "The client pays into escrow",
    body: "The client pays the agreed price plus the payment provider's processing fee. That money is held by Ganyu Hub — the creative can't touch it, and the client can't quietly walk away with the work.",
  },
  {
    n: "3",
    title: "The work happens",
    body: "The creative delivers. The client reviews. If something's off, the client requests a revision — the included revisions were agreed up front in the proposal.",
  },
  {
    n: "4",
    title: "The money is released",
    body: "Once the client approves, escrow is released to the creative and paid out to their mobile money or bank account.",
  },
];

const FAQS = [
  {
    q: "When is the client actually charged?",
    a: "At the moment they accept a proposal. The money goes straight into escrow — it is not sent to the creative until the client approves the delivered work.",
  },
  {
    q: "What if the work is never delivered?",
    a: "The money is still in escrow, not with the creative. Open a dispute from the job page and an admin reviews it. Escrow is only ever released on approval or by an admin decision.",
  },
  {
    q: "What about extra revisions?",
    a: "The proposal states how many revisions are included. Those are free. If the creative offered paid extras, any revision beyond the included count is charged at that agreed rate — and you are always shown the amount and asked to confirm before anything is charged.",
  },
  {
    q: "Does Ganyu Hub take a cut of the provider fees?",
    a: "No. The processing and payout fees go to PayChangu and the mobile-money or bank operator. We never receive a share of them.",
  },
];

export default async function HowMoneyWorksPage() {
  const supabase = createClient();
  const user = await getSessionUser();

  // Viewing this page IS completing the checklist step. Write once, only when
  // unset. No revalidatePath here — calling it during render is what caused
  // FIX-2026-07-13b; the dashboard re-reads on its next visit anyway.
  if (user) {
    const { data: p } = await supabase
      .from("profiles")
      .select("money_guide_seen_at")
      .eq("id", user.id)
      .maybeSingle();
    if (p && !p.money_guide_seen_at) {
      await supabase
        .from("profiles")
        .update({ money_guide_seen_at: new Date().toISOString() })
        .eq("id", user.id);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:py-14">
      <header className="max-w-2xl">
        <p className="eyebrow">Transparency</p>
        <h1 className="mt-2 font-display text-3xl md:text-4xl">
          How the{" "}
          <em
            className="text-stamp"
            style={{ fontStyle: "italic", fontVariationSettings: '"opsz" 144, "SOFT" 100, "WONK" 1' }}
          >
            money
          </em>{" "}
          works
        </h1>
        <p className="mt-3 text-ink/70">
          No surprises at checkout. Here is every fee on the platform, who charges it, and exactly
          what each side ends up with.
        </p>
      </header>

      {BETA_ZERO_COMMISSION && (
        <p className="mt-6 break-words rounded-xl border border-stamp/25 bg-stamp/[0.06] px-4 py-3 text-sm text-ink/80">
          <strong className="text-ink">Ganyu Hub is in beta, so we take no commission at all.</strong>{" "}
          Creatives keep the full agreed price. The only deductions are the payment provider&apos;s
          own fees — we don&apos;t receive a share of those.
        </p>
      )}

      <section className="mt-10">
        <h2 className="font-display text-2xl">The four steps</h2>
        <ol className="mt-4 space-y-3">
          {STEPS.map((s) => (
            <li key={s.n} className="flex gap-4 rounded-xl border border-ink/10 bg-paper p-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-stamp text-sm font-bold text-paper">
                {s.n}
              </span>
              <span className="min-w-0">
                <span className="block font-medium text-ink">{s.title}</span>
                <span className="mt-1 block break-words text-sm text-ink/70">{s.body}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-10">
        <MoneyCalculator />
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl">Who charges what</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[32rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-ink/15 text-left text-xs uppercase tracking-wider text-ink/50">
                <th className="py-2 pr-4 font-semibold">Fee</th>
                <th className="py-2 pr-4 font-semibold">Who charges it</th>
                <th className="py-2 font-semibold">How much</th>
              </tr>
            </thead>
            <tbody className="text-ink/75">
              <tr className="border-b border-ink/10">
                <td className="py-3 pr-4 font-medium text-ink">Processing fee</td>
                <td className="py-3 pr-4">The payment provider (PayChangu)</td>
                <td className="py-3">
                  {Math.round(COLLECTION_RATE * 100)}% of the price, added at checkout — the same
                  whether you pay by mobile money, card or bank transfer
                </td>
              </tr>
              <tr className="border-b border-ink/10">
                <td className="py-3 pr-4 font-medium text-ink">Ganyu Hub commission</td>
                <td className="py-3 pr-4">Us</td>
                <td className="py-3">
                  {BETA_ZERO_COMMISSION ? (
                    <span className="font-medium text-stamp-dark">
                      0% — waived during beta (normally {Math.round(PLATFORM_COMMISSION * 100)}%)
                    </span>
                  ) : (
                    `${Math.round(PLATFORM_COMMISSION * 100)}% of the agreed price`
                  )}
                </td>
              </tr>
              <tr className="border-b border-ink/10">
                <td className="py-3 pr-4 font-medium text-ink">Payout fee</td>
                <td className="py-3 pr-4">The mobile-money or bank provider</td>
                <td className="py-3">
                  {Math.round(PAYOUT_RATE * 100)}% on transfer out. Bank transfers add a flat MWK
                  700 — that&apos;s the bank&apos;s own charge, and it doesn&apos;t shrink on small
                  amounts, so mobile money is usually better value on smaller jobs.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-ink/55">
          Payouts below {formatMwk(MIN_PAYOUT_MWK)} aren&apos;t sent — the transfer fee would consume
          the whole amount.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl">Common questions</h2>
        <div className="mt-4 space-y-2">
          {FAQS.map((f) => (
            <details
              key={f.q}
              className="rounded-xl border border-ink/10 bg-paper px-4 py-3 text-sm text-ink/80"
            >
              <summary className="cursor-pointer list-none font-medium text-ink marker:content-none">
                {f.q}
              </summary>
              <p className="mt-2 break-words">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/dashboard" className="btn-primary">
          Back to dashboard
        </Link>
        <Link href="/jobs/new" className="btn-ghost">
          Post a job
        </Link>
      </div>
    </div>
  );
}
