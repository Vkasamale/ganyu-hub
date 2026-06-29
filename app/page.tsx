import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CATEGORIES } from "@/lib/types";
import { HeroSearch } from "@/components/hero-search";

export default async function Home() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let role: "client" | "creative" | "agency" | null = null;
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    role = (profile?.role as typeof role) || null;
  }

  // pill links depend on auth + role; intent stays the same ("hire" vs "find work")
  const pill = !user
    ? {
        left: { label: "I'm hiring", href: "/signup?role=client", active: true },
        right: { label: "I'm a creative", href: "/signup?role=creative", active: false },
      }
    : role === "creative"
    ? {
        left: { label: "Find jobs", href: "/jobs", active: true },
        right: { label: "Your dashboard", href: "/dashboard", active: false },
      }
    : role === "agency"
    ? {
        left: { label: "Find jobs", href: "/jobs", active: true },
        right: { label: "Post a job", href: "/jobs/new", active: false },
      }
    : {
        left: { label: "Post a job", href: "/jobs/new", active: true },
        right: { label: "Find creatives", href: "/browse", active: false },
      };

  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl grid-cols-1 gap-6 px-4 pb-6 pt-6 md:grid-cols-[1.5fr_1fr] md:gap-12 md:pb-8 md:pt-8">
        {/* LEFT — eyebrow → pill → headline → subhead → search, with a press-mark footer pinning the bottom */}
        <div className="flex flex-col justify-between">
          <div>
            <p className="eyebrow">Ganyu · Dignified</p>

            <div className="mt-4 inline-flex w-fit rounded-full border border-ink/15 bg-paper p-1 text-sm">
              <Link
                href={pill.left.href}
                className="rounded-full bg-stamp px-4 py-1.5 font-medium text-paper transition-colors hover:bg-stamp-dark"
              >
                {pill.left.label}
              </Link>
              <Link
                href={pill.right.href}
                className="rounded-full px-4 py-1.5 font-medium text-ink/75 transition-colors hover:text-ink"
              >
                {pill.right.label}
              </Link>
            </div>

            <h1 className="mt-5 font-display text-5xl leading-[0.95] md:text-[5.5rem]">
              <span>Hire</span>{" "}
              <span aria-hidden className="relative -top-2 inline-block align-top">
                <svg viewBox="0 0 36 36" className="h-7 w-7 text-stamp md:h-9 md:w-9">
                  <g fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <line x1="18" y1="3" x2="18" y2="33" />
                    <line x1="3" y1="18" x2="33" y2="18" />
                    <line x1="7" y1="7" x2="29" y2="29" />
                    <line x1="29" y1="7" x2="7" y2="29" />
                  </g>
                  <circle cx="18" cy="18" r="3" fill="currentColor" />
                </svg>
              </span>{" "}
              <br className="hidden md:block" />
              <em className="relative inline-block text-stamp" style={{ fontStyle: "italic", fontVariationSettings: '"opsz" 144, "SOFT" 100, "WONK" 1' }}>
                Malawian creatives.
                <svg aria-hidden viewBox="0 0 360 14" className="absolute -bottom-2 left-0 h-3 w-full text-stamp/70">
                  <path d="M2 9 C 60 2, 120 13, 180 7 S 300 2, 358 9" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </em>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-ink/75 md:text-lg">
              A working press for designers, developers, photographers, and writers
              across Lilongwe, Blantyre, and Mzuzu. Post a job, pick someone good, settle the work.
            </p>

            <div className="mt-7">
              <HeroSearch />
            </div>
          </div>

          {/* press-mark footer — pins to the bottom of the left column, fills the page on tall screens */}
          <div className="mt-8 flex items-end justify-between gap-4 pt-6 text-xs">
            <p className="eyebrow">Blantyre · Lilongwe · Mzuzu</p>
          </div>
        </div>

        {/* RIGHT — categories as a vertical Fraunces list, evenly distributed full height */}
        <aside className="flex flex-col md:pt-2">
          <p className="eyebrow">Browse by skill</p>
          <ul className="mt-3 flex flex-1 flex-col justify-between divide-y divide-ink/15 border-y border-ink/15">
            {CATEGORIES.map((c) => (
              <li key={c} className="flex-1">
                <Link
                  href={`/browse?category=${encodeURIComponent(c)}`}
                  className="group flex h-full items-center justify-between gap-3 py-3 transition-colors hover:bg-wash/40"
                >
                  <span className="font-display text-2xl leading-tight text-ink/55 transition-colors group-hover:text-stamp md:text-3xl">
                    {c}
                  </span>
                  <span
                    aria-hidden
                    className="font-display text-2xl italic text-ink/0 transition-colors group-hover:text-stamp md:text-3xl"
                    style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100, "WONK" 1' }}
                  >
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/browse"
            className="mt-4 text-sm text-ink/70 underline decoration-ink/30 underline-offset-4 hover:text-ink hover:decoration-ink"
          >
            See every creative →
          </Link>
        </aside>
      </div>
    </section>
  );
}
