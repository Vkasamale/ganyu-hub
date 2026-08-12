"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Share, X } from "lucide-react";

/**
 * Install-the-app banner, pinned above the nav. IMPLEMENTATION_PLAN.md L1b,
 * audit §Q8.
 *
 * `components/push-banner.tsx` already carried an iOS Add-to-Home-Screen hint,
 * but it only renders on the dashboard — behind sign-in, which is the wrong
 * side of the door for install. This is the signed-out half of that.
 *
 * It lives in `app/layout.tsx` rather than on the landing page because the nav
 * is `sticky top-0`; anything rendered inside the page is below it by
 * definition, and §Q8 puts this above everything.
 *
 * Not copying Fiverr's ★4.9 (670k) — we have no store listing and never will.
 * We are a PWA, and a fabricated rating is exactly the hollow trust signal
 * §M3 argues against.
 */

const DISMISS_KEY = "ganyu-install-dismissed";

type BeforeInstallPromptEvent = Event & { prompt: () => Promise<void> };

export function InstallBanner() {
  const pathname = usePathname();
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [iosHint, setIosHint] = useState(false);
  // Assume dismissed until localStorage says otherwise, so the banner never
  // flashes in and shoves the page down on a return visit.
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY)) return;

    // Already running from the home screen: there is nothing left to install.
    const standalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (standalone) return;

    setDismissed(false);

    // Safari implements no `beforeinstallprompt`, so iOS can only ever be told
    // how to do it by hand. Same branch push-banner.tsx uses, same reason.
    if (/iphone|ipad|ipod/i.test(navigator.userAgent)) {
      setIosHint(true);
      return;
    }

    const onPrompt = (e: Event) => {
      e.preventDefault(); // hold the event so our own button can fire it
      setInstallEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  }

  // The dashboard has its own banner (push-banner.tsx) which already offers
  // install. Two rows asking for the same thing on one screen is a bug.
  if (pathname?.startsWith("/dashboard")) return null;

  // Nothing to offer unless the browser gave us a prompt to fire or this is an
  // iPhone. That single condition is also what keeps it off desktop Firefox
  // and Safari, where install does not exist — no width check needed.
  if (dismissed || (!installEvent && !iosHint)) return null;

  return (
    <div className="bg-ink text-paper">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2 md:px-8">
        <Image
          src="/logo-g.png"
          alt=""
          width={28}
          height={28}
          className="shrink-0 rounded-md"
        />

        {iosHint ? (
          <p className="min-w-0 flex-1 text-xs leading-snug text-paper/85 md:text-sm">
            <span className="font-medium text-paper">Ganyu Hub works like an app.</span>{" "}
            <span className="inline-flex items-center gap-1">
              Tap <Share className="h-3.5 w-3.5" aria-hidden /> then
            </span>{" "}
            <span className="font-medium text-paper">Add to Home Screen</span>.
          </p>
        ) : (
          <p className="min-w-0 flex-1 text-xs leading-snug text-paper/85 md:text-sm">
            <span className="font-medium text-paper">Ganyu Hub works like an app.</span>{" "}
            {/* Three lines of copy on a 375px screen makes a permanent bar
                above everything far too tall. The headline carries it alone;
                the detail is a desktop luxury. */}
            <span className="hidden sm:inline">
              Install it and it opens full screen, no browser bar.
            </span>
          </p>
        )}

        {installEvent && (
          <button
            type="button"
            onClick={async () => {
              await installEvent.prompt();
              // Fired once and it is spent — the browser will not honour a
              // second call on the same event, whatever the user chose.
              setInstallEvent(null);
              dismiss();
            }}
            className="shrink-0 rounded-full bg-brand px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-dark md:text-sm"
          >
            Install
          </button>
        )}

        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          className="shrink-0 rounded-full p-1 text-paper/50 transition-colors hover:bg-paper/10 hover:text-paper"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
