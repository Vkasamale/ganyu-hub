import Link from "next/link";

export const metadata = { title: "Terms of Service — Ganyu Hub" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 text-ink">
      <h1 className="text-3xl font-semibold">Terms of Service</h1>
      <p className="mt-2 text-sm text-ink/60">Last updated: 15 July 2026</p>

      <div className="prose prose-sm mt-8 max-w-none space-y-6 text-[15px] leading-relaxed">
        <p>
          Ganyu Hub is a marketplace that connects Malawian creatives with clients
          who want to hire them. We are based in Blantyre, Malawi. By using the
          site you agree to these terms. If you don&apos;t agree, don&apos;t use the site.
        </p>

        <section className="card-soft p-5">
          <h2 className="text-lg font-semibold">1. Who we are</h2>
          <p>
            &quot;Ganyu Hub&quot;, &quot;we&quot;, &quot;us&quot; means Ganyu Hub, Blantyre, Malawi. Contact us
            at any time through the report form in the footer.
          </p>
        </section>

        <section className="card-soft p-5">
          <h2 className="text-lg font-semibold">2. How money moves (escrow)</h2>
          <p>
            When a client accepts a proposal, the client pays the full amount
            through our payments partner PayChangu. That money is <strong>held by
            us in escrow</strong> — the creative does not receive it until the
            client approves the finished work, or until a cancellation is resolved.
          </p>
          <p>
            <strong>You must not take payment off-platform.</strong> If a job is
            arranged through Ganyu Hub, payment for it goes through Ganyu Hub.
            Off-platform payments have no escrow, no dispute path, and no proof —
            you are on your own. Repeat off-platform activity gets accounts
            suspended.
          </p>
        </section>

        <section className="card-soft p-5">
          <h2 className="text-lg font-semibold">3. Our fee</h2>
          <p>
            We take a flat <strong>15% commission</strong> on the agreed job price,
            deducted from the creative&apos;s payout. The net payout is shown to the
            creative before they accept.
          </p>
          <p>
            Payment-processing fees (mobile money, card, bank transfer) are shown
            separately at checkout and are paid by the client on top of the bid.
            Payout fees to move money to the creative&apos;s account are deducted
            from the payout and shown before payout is confirmed.
          </p>
        </section>

        <section className="card-soft p-5">
          <h2 className="text-lg font-semibold">4. Cancellations</h2>
          <p>
            Either side can request a cancellation. The split of the held money
            depends on when the cancellation happens and who requested it — the
            details are shown in the cancellation flow before you confirm.
          </p>
          <p>
            Some cancellation splits give the platform 10%, others 15%. In every
            case we reserve a small amount per side to cover payout transfer
            fees, and payouts below MWK 1,000 are rolled to the platform because
            transfer fees would consume the whole amount.
          </p>
        </section>

        <section className="card-soft p-5">
          <h2 className="text-lg font-semibold">5. Disputes</h2>
          <p>
            If a client and creative can&apos;t agree, either side can open a
            dispute. An admin reviews the messages, the delivered work, and the
            job history, then decides how the held money is split. Our decision
            is final for the purposes of releasing the escrow.
          </p>
        </section>

        <section className="card-soft p-5">
          <h2 className="text-lg font-semibold">6. Your account and ID</h2>
          <p>
            Creatives must submit a valid ID before receiving any payout. Clients
            provide name and phone for the closed beta; a full ID may be required
            before public launch. IDs are stored securely and used only to verify
            you and to comply with local law.
          </p>
          <p>
            You are responsible for your account. Don&apos;t share your password.
            Tell us right away if you think your account has been accessed by
            someone else.
          </p>
        </section>

        <section className="card-soft p-5">
          <h2 className="text-lg font-semibold">7. Content rules</h2>
          <p>
            No adult content. No political campaigning. No pyramid / MLM schemes.
            No illegal work. See the <Link href="/content-policy" className="underline">content policy</Link> for
            detail. We can remove content and suspend accounts that break these
            rules.
          </p>
        </section>

        <section className="card-soft p-5">
          <h2 className="text-lg font-semibold">8. What we don&apos;t promise</h2>
          <p>
            We are a marketplace. We are not the employer, not the client, and
            not the creative. We don&apos;t guarantee that any job will be posted,
            accepted, or completed to your satisfaction. We do our best to keep
            the site running, but we don&apos;t guarantee zero downtime.
          </p>
        </section>

        <section className="card-soft p-5">
          <h2 className="text-lg font-semibold">9. Changes</h2>
          <p>
            We may update these terms. The &quot;Last updated&quot; date at the top will
            change and material changes will be flagged in-app.
          </p>
        </section>

        <p className="pt-4 text-sm text-ink/60">
          See also our <Link href="/privacy" className="underline">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}
