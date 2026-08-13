"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isActive, primaryDestinations, type NavRole } from "@/lib/nav";

/**
 * Item 60 (§K3) — verb-based desktop nav.
 *
 * "Find work · Deliver work · Get paid" is the creative's whole relationship
 * with this product, in order. The old header said "Find creatives / Find
 * jobs" to everyone regardless of which side they were on, and everything
 * else — proposals, payouts, portfolio — lived in a dropdown.
 *
 * Hidden below `md`: the bottom tab bar owns mobile (§A). Two nav shells on
 * one screen is how you get two answers to "where am I".
 */
export function PrimaryNav({ role }: { role: NavRole }) {
  const pathname = usePathname();
  const items = primaryDestinations(role);

  return (
    <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
      {items.map((d) => {
        const on = isActive(pathname, d);
        return (
          <Link
            key={d.href}
            href={d.href}
            aria-current={on ? "page" : undefined}
            className={
              "rounded-lg px-3 py-1.5 text-sm transition-colors " +
              (on
                ? "bg-ink/[0.06] font-medium text-ink"
                : "text-ink/70 hover:bg-ink/[0.04] hover:text-ink")
            }
          >
            {d.label}
          </Link>
        );
      })}
    </nav>
  );
}
