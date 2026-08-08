"use client";

import { useEffect } from "react";

// ponytail: registration only, no state and no UI. The install prompt lives in
// components/push-banner.tsx next to the permission ask, because that's the one
// place a user has a reason to care. Mounted once in app/layout.tsx.
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    // Fire-and-forget: a failed registration must never surface to the user or
    // break the page. The app works fine without a worker — it just isn't
    // installable and can't receive push.
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);
  return null;
}
