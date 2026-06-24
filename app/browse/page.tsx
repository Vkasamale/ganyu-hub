import { createClient } from "@/lib/supabase/server";
import { CreativeCard } from "@/components/creative-card";
import { CATEGORIES } from "@/lib/types";
import Link from "next/link";

export default async function BrowsePage({ searchParams }: { searchParams: { category?: string } }) {
  const supabase = createClient();
  let query = supabase.from("profiles").select("*").in("role", ["creative", "agency"]).order("created_at", { ascending: false });
  if (searchParams.category) query = query.contains("categories", [searchParams.category]);
  const { data: profiles } = await query;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">Browse Malawian creatives</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link href="/browse" className={`rounded-full border px-3 py-1 text-sm ${!searchParams.category ? "border-brand text-brand" : "border-neutral-300"}`}>All</Link>
        {CATEGORIES.map((c) => (
          <Link
            key={c}
            href={`/browse?category=${encodeURIComponent(c)}`}
            className={`rounded-full border px-3 py-1 text-sm ${searchParams.category === c ? "border-brand text-brand" : "border-neutral-300"}`}
          >{c}</Link>
        ))}
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(profiles || []).map((p) => <CreativeCard key={p.id} profile={p} />)}
        {(!profiles || profiles.length === 0) && (
          <p className="col-span-full text-neutral-500">No creatives yet. Check back soon.</p>
        )}
      </div>
    </div>
  );
}
