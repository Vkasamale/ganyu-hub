import { createClient } from "@/lib/supabase/server";
import { HomeHero } from "@/components/home-hero";
import {
  CategoryGrid,
  ClosingCta,
  HowItWorks,
  ValueProps,
} from "@/components/home-sections";


export default async function HomePage() {
  const supabase = createClient();

  // ponytail: pulling the same money numbers /admin computes, but only the 3
  // headline ones. Cheap: one jobs SELECT + one profiles head-count.
  const [{ data: moneyJobs }, { count: creativesLive }] = await Promise.all([
    supabase
      .from("jobs")
      .select("status, escrow_status, total_paid_mwk, accepted_bid_mwk"),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .in("role", ["creative", "agency"]),
  ]);

  let gmv = 0;
  let jobsCompleted = 0;
  for (const r of moneyJobs || []) {
    const bid = (r.total_paid_mwk as number | null) ?? (r.accepted_bid_mwk as number | null) ?? 0;
    const funded = r.escrow_status === "payment_held" || r.escrow_status === "payment_released";
    if (funded) gmv += bid;
    if (r.status === "completed") jobsCompleted += 1;
  }

  // Under 3 completed jobs and the row is just noise — hide it for now so the
  // page reads clean during pre-launch.
  const showProof = jobsCompleted >= 3;

  return (
    <>
      <HomeHero />
      {showProof && <ProofRow gmv={gmv} jobsCompleted={jobsCompleted} creativesLive={creativesLive || 0} />}
      <ValueProps />
      <CategoryGrid />
      <HowItWorks />
      <ClosingCta />
    </>
  );
}

function ProofRow({ gmv, jobsCompleted, creativesLive }: { gmv: number; jobsCompleted: number; creativesLive: number }) {
  return (
    <section className="border-y border-ink/10 bg-wash/40 py-10">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-ink/55">Real numbers · Ganyu Hub to date</p>
        <div className="mt-4 grid gap-6 sm:grid-cols-3">
          <ProofTile value={fmtMwk(gmv)} label="Paid through the platform" />
          <ProofTile value={jobsCompleted.toLocaleString()} label={`Job${jobsCompleted === 1 ? "" : "s"} completed`} />
          <ProofTile value={creativesLive.toLocaleString()} label={`Malawian creative${creativesLive === 1 ? "" : "s"} live`} />
        </div>
      </div>
    </section>
  );
}

function ProofTile({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-display text-3xl font-semibold text-ink md:text-4xl">{value}</p>
      <p className="mt-1 text-sm text-ink/60">{label}</p>
    </div>
  );
}

function fmtMwk(n: number): string {
  if (n >= 1_000_000) return `MWK ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `MWK ${(n / 1_000).toFixed(0)}k`;
  return `MWK ${n.toLocaleString()}`;
}
