// Served by public/sw.js when a navigation fails. Must be a plain static page
// with no data fetching — it is precached at service-worker install time and
// rendered when there is, by definition, no network.
export const metadata = { title: "Offline — Ganyu Hub" };

export default function OfflinePage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
      <h1 className="font-display text-3xl">You&apos;re offline</h1>
      <p className="text-ink/60">
        Ganyu Hub needs a connection to show your jobs, messages and payments — none of
        it is stored on this device. Reconnect and try again.
      </p>
      <a
        href="/dashboard"
        className="rounded-full bg-brand px-5 py-2 text-sm font-medium text-white hover:bg-brand-dark"
      >
        Try again
      </a>
    </div>
  );
}
