"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Item = { href: string; label: string; icon: React.ReactNode };

const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.75, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const I = (path: React.ReactNode) => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 text-neutral-500" {...stroke}>{path}</svg>
);

const ICONS = {
  user: I(<><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-7 8-7s8 3 8 7" /></>),
  shield: I(<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />),
  card: I(<><rect x="2.5" y="5" width="19" height="14" rx="2" /><path d="M2.5 10h19" /></>),
  briefcase: I(<><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></>),
  inbox: I(<><path d="M3 13l3-8h12l3 8" /><path d="M3 13v6a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6h-6a3 3 0 0 1-6 0H3z" /></>),
  bookmark: I(<path d="M6 3h12v18l-6-4-6 4z" />),
  layout: I(<><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" /></>),
  folder: I(<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />),
  list: I(<><path d="M8 6h13M8 12h13M8 18h13" /><circle cx="4" cy="6" r="1" /><circle cx="4" cy="12" r="1" /><circle cx="4" cy="18" r="1" /></>),
  globe: I(<><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></>),
  external: I(<><path d="M14 4h6v6" /><path d="M20 4l-9 9" /><path d="M19 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5" /></>),
  shieldStar: I(<><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" /><path d="M12 8l1.2 2.5L16 11l-2 1.8.5 2.7L12 14.2 9.5 15.5 10 12.8 8 11l2.8-.5z" /></>),
  signout: (
    <svg viewBox="0 0 24 24" className="h-4 w-4 text-red-500" {...stroke}>
      <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
      <path d="M10 17l-5-5 5-5" />
      <path d="M5 12h11" />
    </svg>
  ),
};

export function UserMenu({ name, email, userId, isAdmin }: { name: string | null; email: string | null; userId: string; isAdmin?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const initial = (name || email || "?").trim().charAt(0).toUpperCase();
  const display = name || email || "Account";

  const account: Item[] = [
    { href: "/dashboard/profile", label: "Edit profile", icon: ICONS.user },
    { href: "/dashboard/account", label: "Account & security", icon: ICONS.shield },
    { href: "/dashboard/payments", label: "Payments", icon: ICONS.card },
  ];
  const work: Item[] = [
    { href: "/dashboard", label: "Dashboard", icon: ICONS.layout },
    { href: "/dashboard/jobs", label: "Jobs", icon: ICONS.briefcase },
    { href: "/dashboard/proposals", label: "Proposals", icon: ICONS.inbox },
    { href: "/messages", label: "Messages", icon: ICONS.inbox },
    { href: "/dashboard/saved", label: "Saved", icon: ICONS.bookmark },
    { href: "/dashboard/portfolio", label: "Portfolio", icon: ICONS.folder },
    { href: "/dashboard/services", label: "Rate card", icon: ICONS.list },
  ];
  const browse: Item[] = [
    { href: `/creatives/${userId}`, label: "View public profile", icon: ICONS.external },
    { href: "/browse", label: "Browse creatives", icon: ICONS.globe },
    { href: "/jobs", label: "Browse jobs", icon: ICONS.briefcase },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white py-1 pl-1 pr-3 text-sm transition-colors hover:border-neutral-300"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-stamp text-xs font-bold text-white">{initial}</span>
        <span className="hidden max-w-[120px] truncate font-medium sm:inline">{display}</span>
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-72 max-w-[calc(100vw-1rem)] overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.10)]">
          <div className="flex items-center gap-3 px-4 py-3.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-stamp text-sm font-semibold text-white">{initial}</span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-neutral-900">{name || "Unnamed"}</p>
              <p className="truncate text-xs text-neutral-500">{email}</p>
            </div>
          </div>

          <Section items={account} onPick={() => setOpen(false)} />
          <Section items={work} onPick={() => setOpen(false)} />
          <Section items={browse} onPick={() => setOpen(false)} />

          {isAdmin && (
            <Section
              items={[{ href: "/admin", label: "Admin", icon: ICONS.shieldStar }]}
              onPick={() => setOpen(false)}
            />
          )}

          <div className="border-t border-neutral-100">
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50"
              >
                {ICONS.signout}
                Log out
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ items, onPick }: { items: Item[]; onPick: () => void }) {
  return (
    <nav className="border-t border-neutral-100 py-1.5">
      {items.map((it) => (
        <Link
          key={it.href + it.label}
          href={it.href}
          onClick={onPick}
          className="flex items-center gap-3 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
        >
          {it.icon}
          <span>{it.label}</span>
        </Link>
      ))}
    </nav>
  );
}
