"use client";

import { useEffect } from "react";
import { driver } from "driver.js";
import { markMilestone } from "@/app/actions";
import "driver.js/dist/driver.css";

// One-time guided tour on the dashboard: spotlight popovers pointing at the real
// nav / workspace / reminders. Runs once per USER — the seen flag lives on the
// profile (profiles.toured_at), not localStorage, so signing in on another
// browser or device doesn't replay it. Skip/close also marks it seen.
export function ProductTour({
  role,
  seen,
}: {
  role: "client" | "creative" | "agency";
  seen: boolean;
}) {
  useEffect(() => {
    if (seen) return;

    const isClient = role === "client";
    let marked = false;
    const markSeen = () => {
      if (marked) return; // onDestroyed can fire more than once
      marked = true;
      void markMilestone("tour");
    };

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
  }, [role, seen]);

  return null;
}
