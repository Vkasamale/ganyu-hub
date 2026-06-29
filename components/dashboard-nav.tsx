"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = { href: string; label: string };

export function DashboardNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav className="mt-3 flex flex-col gap-1 text-sm">
      {items.map((n) => {
        const active = n.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(n.href);
        return (
          <Link
            key={n.href}
            href={n.href}
            className={
              active
                ? "rounded-md bg-ink px-3 py-2 font-medium text-paper"
                : "rounded-md px-3 py-2 text-ink/75 transition-colors hover:bg-wash/60 hover:text-ink"
            }
          >
            {n.label}
          </Link>
        );
      })}
    </nav>
  );
}
