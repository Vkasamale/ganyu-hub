"use client";

import { useEffect, useState } from "react";
import { Bell, Download, X } from "lucide-react";
import { toast } from "sonner";
import { savePushSubscription } from "@/app/actions";

const DISMISS_KEY = "ganyu-push-dismissed";

// VAPID keys travel as base64url; PushManager.subscribe wants raw bytes.
function urlBase64ToUint8Array(base64: string) {
  const padded = (base64 + "=".repeat((4 - (base64.length % 4)) % 4))
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const raw = atob(padded);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

type BeforeInstallPromptEvent = Event & { prompt: () => Promise<void> };

/**
 * Dashboard banner offering (a) install and (b) notification permission.
 *
 * Renders nothing at all unless there is something to ask for. In particular
 * it never reappears once permission is denied — a browser only honours the
 * first request anyway, so a second banner would be a button that does
 * nothing. That's the "no repeated nagging" requirement, enforced by the
 * `permission === "default"` gate rather than by a counter.
 */
export function PushBanner() {
  const [show, setShow] = useState(false);
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // iOS Safari in a plain tab has no PushManager at all — it only appears
    // once the app is on the home screen. So on iOS this banner stays silent
    // until installed, which is the platform's behaviour, not a bug.
    const canPush =
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window;
    if (!canPush) return;

    const onInstallPrompt = (e: Event) => {
      e.preventDefault(); // keep the event so the user can trigger it from here
      setInstallEvent(e as BeforeInstallPromptEvent);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", onInstallPrompt);

    if (localStorage.getItem(DISMISS_KEY)) {
      return () => window.removeEventListener("beforeinstallprompt", onInstallPrompt);
    }

    if (Notification.permission === "granted") {
      // Already granted on this device, but the row can be gone — cleared site
      // data, or lib/push.ts pruned an expired endpoint. Re-register quietly;
      // no prompt is shown, so there is nothing to interrupt.
      void ensureSubscribed().catch(() => {});
    } else if (Notification.permission === "default") {
      setShow(true);
    }
    // "denied" falls through: show stays false, permanently.

    return () => window.removeEventListener("beforeinstallprompt", onInstallPrompt);
  }, []);

  async function ensureSubscribed() {
    const reg = await navigator.serviceWorker.ready;
    const existing = await reg.pushManager.getSubscription();
    const sub =
      existing ||
      (await reg.pushManager.subscribe({
        // Required to be true by every browser: we may only push when we show
        // the user a notification. No silent background pushes.
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "",
        ),
      }));
    const json = sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } };
    return savePushSubscription(json, navigator.userAgent);
  }

  async function enable() {
    if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
      toast.error("Notifications aren't configured yet.");
      return;
    }
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        // Denied or dismissed. Say so once, then get out of the way for good —
        // the browser will not ask again on this origin regardless.
        setShow(false);
        localStorage.setItem(DISMISS_KEY, "1");
        if (permission === "denied") {
          toast("Notifications are off. You can turn them on in your browser settings.");
        }
        return;
      }
      const res = await ensureSubscribed();
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Notifications on. We'll tell you when you get paid.");
      setShow(false);
    } catch {
      // Subscribe can throw on an unsupported push service or a bad VAPID key.
      // The dashboard behind this banner is unaffected — fail quietly.
      toast.error("Could not turn on notifications on this device.");
      setShow(false);
    } finally {
      setBusy(false);
    }
  }

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setShow(false);
  }

  if (!show) return null;

  const needsPermission =
    typeof window !== "undefined" &&
    "Notification" in window &&
    Notification.permission === "default";

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-brand/20 bg-brand/5 px-4 py-3">
      <Bell className="h-5 w-5 shrink-0 text-brand" aria-hidden />
      <p className="min-w-0 flex-1 text-sm text-ink/80">
        Get notified about jobs and payments — enable notifications.
      </p>
      {installEvent && (
        <button
          type="button"
          onClick={async () => {
            await installEvent.prompt();
            setInstallEvent(null);
          }}
          className="inline-flex items-center gap-1.5 rounded-full border border-brand/30 px-3 py-1.5 text-sm text-brand hover:bg-brand/10"
        >
          <Download className="h-4 w-4" aria-hidden /> Install app
        </button>
      )}
      {needsPermission && (
        <button
          type="button"
          onClick={enable}
          disabled={busy}
          className="rounded-full bg-brand px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {busy ? "Enabling…" : "Enable"}
        </button>
      )}
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="rounded-full p-1 text-ink/40 hover:bg-ink/5 hover:text-ink"
      >
        <X className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}
