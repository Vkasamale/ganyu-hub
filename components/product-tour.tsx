"use client";

import { useEffect } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

// One-time guided tour on the dashboard: spotlight popovers pointing at the real
// nav / workspace / reminders. Runs once per browser (localStorage flag), on the
// first dashboard visit after onboarding. Skip/close also marks it seen.
export function ProductTour({ role }: { role: "client" | "creative" | "agency" }) {
  useEffect(() => {
    const KEY = "gh_tour_done_v1";
    if (localStorage.getItem(KEY) === "1") return;

    const isClient = role === "client";
    const markSeen = () => localStorage.setItem(KEY, "1");

    // Let the layout paint (and the nav mount) before measuring targets.
    const timer = setTimeout(() => {
      // If the anchor isn't on the page (unexpected layout), don't trap the user.
      if (!document.querySelector('[data-tour="nav"]')) {
        markSeen();
        return;
      }
      const d = driver({
        showProgress: true,
        allowClose: true,
        overlayColor: "rgba(26,22,17,0.6)",
        nextBtnText: "Next",
        prevBtnText: "Back",
        doneBtnText: "Got it",
        onDestroyed: markSeen,
        steps: [
          {
            element: '[data-tour="nav"]',
            popover: {
              title: "Your menu 🧭",
              description: isClient
                ? "Everything's here — post jobs, review proposals, and manage payments."
                : "Everything's here — find work, send proposals, and manage your portfolio & payouts.",
            },
          },
          {
            element: '[data-tour="main"]',
            popover: {
              title: "Your workspace",
              description: "This is home: your get-started checklist, stats, and quick actions.",
            },
          },
          {
            element: '[data-tour="reminders"]',
            popover: {
              title: "Reminders",
              description: isClient
                ? "Anything that needs you — a new proposal, work to review — shows up here."
                : "Anything that needs you — scope to confirm, work to submit — shows up here.",
            },
          },
        ],
      });
      d.drive();
    }, 700);

    return () => clearTimeout(timer);
  }, [role]);

  return null;
}
