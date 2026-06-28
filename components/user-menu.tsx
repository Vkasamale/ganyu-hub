"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Item = { href: string; label: string };

const ITEMS: Item[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/account", label: "Account & security" },
  { href: "/dashboard/profile", label: "Edit profile" },
  { href: "/dashboard/portfolio", label: "Portfolio" },
  { href: "/dashboard/services", label: "Rate card" },
  { href: "/dashboard/jobs", label: "Jobs" },
  { href: "/dashboard/proposals", label: "Proposals" },
  { href: "/dashboard/saved", label: "Saved" },
  { href: "/messages", label: "Messages" },
  { href: "/browse", label: "Browse creatives" },
  { href: "/jobs", label: "Browse jobs" },
];

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

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white py-1 pl-1 pr-3 text-sm hover:border-brand"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">{initial}</span>
        <span className="hidden max-w-[120px] truncate font-medium sm:inline">{display}</span>
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-lg">
          <div className="border-b border-neutral-100 px-3 py-2">
            <p className="truncate text-sm font-medium">{name || "Unnamed"}</p>
            <p className="truncate text-xs text-neutral-500">{email}</p>
          </div>
          <nav className="max-h-[60vh] overflow-y-auto py-1">
            {ITEMS.map((it) => (
              <Link
                key={it.href}
                href={it.href}
                onClick={() => setOpen(false)}
                className="block px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
              >
                {it.label}
              </Link>
            ))}
            <Link
              href={`/creatives/${userId}`}
              onClick={() => setOpen(false)}
              className="block px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
            >
              View public profile
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="block border-t border-neutral-100 px-3 py-2 text-sm font-medium text-brand hover:bg-neutral-50"
              >
                Admin
              </Link>
            )}
          </nav>
          <form action="/auth/signout" method="post" className="border-t border-neutral-100">
            <button
              type="submit"
              className="block w-full px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50"
            >
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
