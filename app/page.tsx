import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES } from "@/lib/types";

export default function Home() {
  return (
    <div>
      <section className="mx-auto max-w-6xl px-4 py-20 md:py-28">
        <Badge className="mb-4 bg-brand/10 text-brand border-brand/20">Made in Malawi</Badge>
        <h1 className="max-w-3xl text-4xl font-bold leading-tight md:text-6xl">
          Hire Malawi&apos;s best creatives.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-neutral-600">
          Ganyu Hub is the marketplace for designers, developers, video pros, and writers
          across Malawi. Post a job, browse portfolios, hire with confidence.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/jobs/new"><Button size="lg">Post a job</Button></Link>
          <Link href="/browse"><Button variant="outline" size="lg">Browse creatives</Button></Link>
        </div>
      </section>

      <section className="border-t border-neutral-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-16 md:grid-cols-4">
          {CATEGORIES.map((c) => (
            <Link key={c} href={`/browse?category=${encodeURIComponent(c)}`}>
              <div className="rounded-lg border border-neutral-200 p-6 transition hover:border-brand">
                <p className="font-semibold">{c}</p>
                <p className="mt-1 text-sm text-neutral-500">Browse →</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
