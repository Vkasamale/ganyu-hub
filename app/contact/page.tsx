import Link from "next/link";

export const metadata = { title: "Contact | Ganyu Hub" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 text-ink">
      <h1 className="text-3xl font-semibold">Contact</h1>
      <p className="mt-2 text-sm text-ink/60">The fastest ways to reach a real person on the Ganyu Hub team.</p>

      <div className="mt-8 space-y-6 text-[15px] leading-relaxed">
        <section className="card-soft p-5">
          <h2 className="text-lg font-semibold">WhatsApp or call</h2>
          <p className="mt-2">
            <a className="underline" href="tel:+265886072933">+265 886 072 933</a>
          </p>
          <p className="mt-1 text-sm text-ink/70">Fastest for urgent issues with a job in progress.</p>
        </section>

        <section className="card-soft p-5">
          <h2 className="text-lg font-semibold">Email</h2>
          <p className="mt-2">
            <a className="underline" href="mailto:CiTiMrKt@gmail.com">CiTiMrKt@gmail.com</a>
          </p>
          <p className="mt-1 text-sm text-ink/70">Best for anything with attachments, or when a written record helps.</p>
        </section>

        <section className="card-soft p-5">
          <h2 className="text-lg font-semibold">Report a specific issue</h2>
          <p className="mt-2">
            If it&apos;s tied to a job, proposal, or another user, use the report form. It routes straight to us with the job context attached.
          </p>
          <p className="mt-2">
            <Link className="underline" href="/dashboard/report">Open the report form</Link>
          </p>
        </section>

        <section className="card-soft p-5">
          <h2 className="text-lg font-semibold">Where we are</h2>
          <p className="mt-2">Blantyre, Malawi.</p>
        </section>
      </div>
    </div>
  );
}
