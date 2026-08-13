import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BrowsePage from "@/app/browse/page";
import { absUrl } from "@/lib/site-url";
import { ALL_CATEGORY_SLUGS, categoryFromSlug, categorySlug, taskPhrase } from "@/lib/task-phrases";

/**
 * Item 49 (§O3) — category landing pages with plain-language descriptions.
 *
 * Now worth building: ganyuhub.com is live, so search traffic is a real
 * channel rather than a hypothetical one on a *.vercel.app host.
 *
 * ponytail: this renders BrowsePage rather than re-running its query. The
 * filtering, price aggregation, rating shrinkage and completeness gate are all
 * non-trivial and already correct — a second copy would drift within a month.
 * This page owns exactly two things the listing does not have: a real URL with
 * metadata, and words a first-time client understands.
 */

export function generateStaticParams() {
  return ALL_CATEGORY_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = categoryFromSlug(slug);
  if (!category) return {};
  const phrase = taskPhrase(category);
  return {
    title: `${category} in Malawi — hire on Ganyu Hub`,
    // The phrase is how people actually search ("build a website"), which the
    // taxonomy word alone is not.
    description: `${phrase}? Find Malawian ${category.toLowerCase()} freelancers on Ganyu Hub. Compare prices and turnaround, and pay into escrow that is only released when you approve the work.`,
    alternates: { canonical: absUrl(`/c/${slug}`) },
  };
}

export default async function CategoryLandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = categoryFromSlug(slug);
  if (!category) notFound();

  const phrase = taskPhrase(category);

  return (
    <BrowsePage
      searchParams={Promise.resolve({ category })}
      title={phrase || category}
      action={`/c/${categorySlug(category)}`}
      intro={
        <div className="mt-4 max-w-2xl space-y-3 text-sm leading-relaxed text-ink/70">
          <p>
            Everyone below works in <strong className="font-medium text-ink">{category}</strong> and
            is based in Malawi. Each profile shows what they have made before, what they charge and
            how long they take, so you can compare before you talk to anyone.
          </p>
          <p>
            You do not need to know the technical words for what you want. Describe the job in your
            own words and ask two or three of them what it would cost.
          </p>
          <p>
            Payment is held by Ganyu Hub until you approve the work — the creative cannot take the
            money and disappear, and you are not asked to pay anything up front to browse.
          </p>
        </div>
      }
    />
  );
}
