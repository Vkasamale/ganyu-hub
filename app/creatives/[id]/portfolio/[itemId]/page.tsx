import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default async function PortfolioItemPage({
  params,
}: {
  params: Promise<{ id: string; itemId: string }>;
}) {
  const { id, itemId } = await params;
  const supabase = createClient();
  const { data: item } = await supabase
    .from("portfolio_items")
    .select("*")
    .eq("id", itemId)
    .eq("profile_id", id)
    .single();
  if (!item) notFound();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", id)
    .single();

  const all: string[] = [
    ...(item.cover_url ? [item.cover_url] : []),
    ...(Array.isArray(item.images) ? item.images : []),
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href={`/creatives/${id}`}
        className="inline-flex items-center gap-1 text-sm text-ink/60 hover:text-ink"
      >
        ← Back to {profile?.full_name || "profile"}
      </Link>

      <h1 className="mt-4 font-display text-3xl font-semibold">{item.title}</h1>
      {item.description && (
        <p className="mt-3 whitespace-pre-wrap text-ink/80">{item.description}</p>
      )}
      {item.project_url && (
        <a
          href={item.project_url}
          target="_blank"
          rel="noopener"
          className="mt-3 inline-block text-sm font-medium text-stamp hover:underline"
        >
          View project →
        </a>
      )}

      {all.length > 0 && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {all.map((url, i) => (
            <div key={url} className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-ink/10">
              <Image
                src={url}
                alt={`${item.title} ${i + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
