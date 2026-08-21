"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = { href: string; label: string };

export function DashboardNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);
  const current = items.find((n) => isActive(n.href)) ?? items[0];

  return (
    <>
      {/* Mobile: native <details> dropdown. No JS state, closes on outside tap via <summary>. */}
      <details className="group mt-3 md:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm font-medium text-ink [&::-webkit-details-marker]:hidden">
          <span>{current?.label ?? "Menu"}</span>
          <span aria-hidden className="ml-2 transition-transform group-open:rotate-180">▾</span>
        </summary>
        <div className="mt-1 flex flex-col rounded-md border border-ink/15 bg-paper p-1 shadow-elev-1">
          {items.map((n) => {
            const active = isActive(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={
                  (active ? "bg-ink font-medium text-paper" : "text-ink/75 hover:bg-wash/60 hover:text-ink") +
                  " rounded px-3 py-2 text-sm"
                }
              >
                {n.label}
              </Link>
            );
          })}
        </div>
      </details>

      {/* Desktop: unchanged vertical list. */}
      <nav className="mt-3 hidden flex-col gap-1 text-sm md:flex">
        {items.map((n) => {
          const active = isActive(n.href);
          return (
            <Link
              key={n.href}
              href={n.href}
              className={
                (active ? "bg-ink font-medium text-paper" : "text-ink/75 transition-colors hover:bg-wash/60 hover:text-ink") +
                " rounded-md px-3 py-2"
              }
            >
              {n.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
