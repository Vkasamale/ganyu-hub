"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavIcon } from "@/components/nav-icons";
import { VERSION } from "@/lib/whats-new";
import { drawerGroups, isActive, tabDestinations, type NavRole } from "@/lib/nav";

/**
 * Phase 7 items 56 + 57 (§A, §K1) — the mobile shell.
 *
 * The app is installable, and in standalone mode there is NO BROWSER BACK
 * BUTTON. Until now the only way around was a dropdown in the top-right
 * corner: the furthest point on the screen from a thumb, holding thirteen
 * ungrouped rows.
 *
 * Four destinations plus Menu. **No create action in the bar (§A)** — a "+"
 * between two tabs is the button people hit by accident, and posting a job is
 * a deliberate act that deserves a deliberate button.
 *
 * The drawer is grouped Your work / Settings / Help with the version at the
 * foot (§K1), so it is scannable rather than thirteen flat rows.
 */
export function BottomTabBar({
  role,
  userId,
  isAdmin,
  unreadCount = 0,
}: {
  role: NavRole;
  userId: string;
  isAdmin: boolean;
  unreadCount?: number;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const tabs = tabDestinations(role);
  const groups = drawerGroups(role, { userId, isAdmin });

  // Close on navigation — otherwise tapping a drawer link leaves the sheet
  // sitting over the page you just asked for.
  useEffect(() => setMenuOpen(false), [pathname]);

  // A drawer that scrolls the page behind it feels broken on a phone.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 bg-ink/40"
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-[14px] bg-raised pb-[calc(env(safe-area-inset-bottom)+1rem)] shadow-elev-sheet">
            <div className="sticky top-0 flex justify-center bg-raised py-3">
              <span aria-hidden className="h-1 w-10 rounded-full bg-ink/15" />
            </div>

            {groups.map((g) => (
              <nav key={g.title} className="border-t border-ink/[0.07] px-2 py-2">
                <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink/45">
                  {g.title}
                </p>
                {g.items.map((it) => (
                  <Link
                    key={it.href + it.label}
                    href={it.href}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-ink/80 active:bg-ink/5"
                  >
                    <NavIcon name={it.icon} className="h-[18px] w-[18px] text-ink/45" />
                    <span>{it.label}</span>
                  </Link>
                ))}
              </nav>
            ))}

            <div className="border-t border-ink/[0.07] px-2 py-2">
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 active:bg-red-50"
                >
                  <NavIcon name="external" className="h-[18px] w-[18px]" />
                  Log out
                </button>
              </form>
            </div>

            <p className="px-5 pt-2 text-center text-xs text-ink/40">Ganyu Hub v{VERSION}</p>
          </div>
        </div>
      )}

      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-raised/95 pb-[env(safe-area-inset-bottom)] shadow-elev-2 backdrop-blur md:hidden"
      >
        <ul className="flex items-stretch">
          {tabs.map((t) => {
            const on = isActive(pathname, t);
            return (
              <li key={t.href} className="flex-1">
                <Link
                  href={t.href}
                  aria-current={on ? "page" : undefined}
                  className={
                    "relative flex flex-col items-center gap-0.5 px-1 py-2 text-[10px] font-medium " +
                    (on ? "text-brand-dark" : "text-ink/55")
                  }
                >
                  <NavIcon name={t.icon} className="h-5 w-5" />
                  {t.href === "/messages" && unreadCount > 0 && (
                    <span className="absolute right-[22%] top-1 min-w-[16px] rounded-full bg-stamp px-1 text-[9px] font-bold leading-4 text-paper">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                  <span className="truncate">{t.label}</span>
                </Link>
              </li>
            );
          })}

          <li className="flex-1">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              className="flex w-full flex-col items-center gap-0.5 px-1 py-2 text-[10px] font-medium text-ink/55"
            >
              <NavIcon name="menu" className="h-5 w-5" />
              <span>Menu</span>
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
}
