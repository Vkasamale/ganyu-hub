import Link from "next/link";

export const metadata = { title: "Privacy Policy | Ganyu Hub" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 text-ink">
      <h1 className="text-3xl font-semibold">Privacy Policy</h1>
      <p className="mt-2 text-sm text-ink/60">Last updated: 15 July 2026</p>

      <div className="prose prose-sm mt-8 max-w-none space-y-6 text-[15px] leading-relaxed">
        <p>
          Ganyu Hub (Blantyre, Malawi) runs a marketplace for hiring Malawian
          creatives. This page says, in plain language, what personal data we
          collect, why, and what we do with it.
        </p>

        <section className="card-soft p-5">
          <h2 className="text-lg font-semibold">1. What we collect</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li><strong>Account:</strong> full name, email, password (stored hashed by Supabase Auth), role.</li>
            <li><strong>Profile:</strong> bio, headline, avatar, cover image, portfolio pieces, rate cards. This is public. It&apos;s how clients find you.</li>
            <li><strong>Contact:</strong> phone number, WhatsApp. These stay private until a job is funded, then become visible to the other party.</li>
            <li><strong>ID documents:</strong> Creatives submit an ID image before payout. Stored in a private Supabase Storage bucket; only admins can see it.</li>
            <li><strong>Payments:</strong> job amounts, PayChangu transaction references, payout method details (mobile money number or bank account) you save.</li>
            <li><strong>Activity:</strong> jobs posted, proposals sent, messages, reviews, saves, page views on creative profiles.</li>
          </ul>
        </section>

        <section className="card-soft p-5">
          <h2 className="text-lg font-semibold">2. Why we collect it</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Run the marketplace (match clients with creatives, show profiles, deliver messages).</li>
            <li>Move money safely (escrow, payouts, dispute handling).</li>
            <li>Verify identity to reduce fraud and satisfy Malawian financial-services rules.</li>
            <li>Send you notifications about your jobs (in-app and by email).</li>
            <li>Fix bugs and improve the product.</li>
          </ul>
        </section>

        <section className="card-soft p-5">
          <h2 className="text-lg font-semibold">3. Who we share it with</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li><strong>The other party on a job</strong>:once escrow is funded, both sides see each other&apos;s contact info.</li>
            <li><strong>PayChangu</strong>:our payments partner. They handle collection, holding, and payout of MWK. They see the amounts and the payer/payee details needed to move the money.</li>
            <li><strong>Supabase</strong>:our database and storage provider. Your data lives on their infrastructure.</li>
            <li><strong>Resend</strong>:our email provider. They see the email address we send to and the message contents.</li>
            <li><strong>Vercel</strong>:our hosting provider.</li>
          </ul>
          <p>
            We <strong>don&apos;t sell your data</strong> to advertisers or data
            brokers, and we don&apos;t share it beyond what&apos;s needed to run
            the service, or when required by law.
          </p>
        </section>

        <section className="card-soft p-5">
          <h2 className="text-lg font-semibold">4. How long we keep it</h2>
          <p>
            Account and job data: for as long as your account exists, plus a
            reasonable period after (for records of past jobs, payouts, and
            disputes). ID documents: kept as long as you have an active payout
            history, deleted on request unless we need them for an open dispute
            or a legal requirement. Ask us to delete via the report form and
            we&apos;ll walk you through what can and can&apos;t be removed.
          </p>
        </section>

        <section className="card-soft p-5">
          <h2 className="text-lg font-semibold">5. Your rights</h2>
          <p>
            You can see and edit your profile and account settings any time in
            your dashboard. You can request a copy of your data, or ask us to
            delete your account, by contacting us through the report form.
          </p>
        </section>

        <section className="card-soft p-5">
          <h2 className="text-lg font-semibold">6. Security</h2>
          <p>
            Passwords are hashed by Supabase Auth (we never see your plaintext
            password). ID documents sit in a private storage bucket that isn&apos;t
            publicly reachable. Payments are handled by PayChangu. We never see
            your full card or bank credentials. That said, no online service is
            100% secure. Use a strong, unique password.
          </p>
        </section>

        <section className="card-soft p-5">
          <h2 className="text-lg font-semibold">7. Cookies</h2>
          <p>
            We use a small number of cookies to keep you signed in. We don&apos;t
            run third-party ad trackers.
          </p>
        </section>

        <section className="card-soft p-5">
          <h2 className="text-lg font-semibold">8. Changes</h2>
          <p>
            If we change this policy in a material way we&apos;ll flag it in-app.
            The &quot;Last updated&quot; date at the top always reflects the current
            version.
          </p>
        </section>

        <p className="pt-4 text-sm text-ink/60">
          See also our <Link href="/terms" className="underline">Terms of Service</Link>.
        </p>
      </div>
    </div>
  );
}
