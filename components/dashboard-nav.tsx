"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = { href: string; label: string };

export function DashboardNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  // Mobile: horizontal scrollable pill strip. Desktop (md+): unchanged vertical list.
  // The -mx/px pair lets the scroll strip bleed to the viewport edges while
  // aligning content to the page gutter — nothing gets clipped at either end.
  return (
    <nav
      className="mt-3 -mx-4 flex gap-2 overflow-x-auto px-4 text-sm md:mx-0 md:flex-col md:gap-1 md:overflow-visible md:px-0"
    >
      {items.map((n) => {
        const active = n.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(n.href);
        return (
          <Link
            key={n.href}
            href={n.href}
            className={
              (active
                ? "bg-ink font-medium text-paper"
                : "text-ink/75 transition-colors hover:bg-wash/60 hover:text-ink") +
              " shrink-0 whitespace-nowrap rounded-full border border-ink/15 px-3 py-1.5 md:shrink md:whitespace-normal md:rounded-md md:border-0 md:px-3 md:py-2"
            }
          >
            {n.label}
          </Link>
        );
      })}
    </nav>
  );
}
