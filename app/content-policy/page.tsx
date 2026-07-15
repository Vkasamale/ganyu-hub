export const metadata = { title: "Content policy — Ganyu Hub" };

export default function ContentPolicyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Content policy</h1>
        <p className="text-sm text-ink/60">
          Ganyu Hub is a marketplace for creative work. To keep it useful for everyone, three things are not allowed.
        </p>
      </header>

      <section className="card-soft space-y-2 p-5">
        <h2 className="text-lg font-semibold">No adult or sexual content</h2>
        <p className="text-ink/80">
          Don&apos;t post jobs, portfolios, or messages containing sexual, nude, or explicit material.
        </p>
      </section>

      <section className="card-soft space-y-2 p-5">
        <h2 className="text-lg font-semibold">No political campaign material</h2>
        <p className="text-ink/80">
          Don&apos;t use Ganyu Hub to produce material for political parties, candidates, or campaigns.
        </p>
      </section>

      <section className="card-soft space-y-2 p-5">
        <h2 className="text-lg font-semibold">No MLM or pyramid recruitment</h2>
        <p className="text-ink/80">
          Don&apos;t post work that recruits people into multi-level marketing schemes or pyramid programs.
        </p>
      </section>

      <p className="text-sm text-ink/60">
        We review reports manually. If something breaks these rules, email{" "}
        <a className="underline" href="mailto:hello@ganyu.com">hello@ganyu.com</a>.
      </p>
    </div>
  );
}
