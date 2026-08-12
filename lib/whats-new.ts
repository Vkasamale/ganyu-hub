// Public, user-facing release notes shown in the footer version badge.
// PURPOSELY CURATED — this is NOT CHANGELOG.md. Keep it friendly and product-
// facing; never mention security internals, RLS, schema/DB steps, or anything
// that hands an attacker a map. Newest first; VERSION = the top entry.
export type Release = { version: string; date: string; notes: string[] };

export const RELEASES: Release[] = [
  {
    version: "0.9.1",
    date: "2026-08-12",
    notes: [
      "A real home page: why the escrow works the way it does, every category you can hire in, and how a job runs from posting to payment.",
      "A proper footer — separate routes for hiring and for finding work, category links, and everything folds away on a phone.",
      "Release notes now have a page of their own.",
    ],
  },
  {
    version: "0.9.0",
    date: "2026-08-08",
    notes: [
      "Install Ganyu Hub on your phone — add it to your home screen and it opens like an app, full screen.",
      "Get a notification the moment a client releases your payment, even when the app is closed.",
      "Notifications are opt-in: turn them on from the banner on your dashboard, or ignore it and nothing changes.",
      "A proper offline screen instead of the browser's error page when your connection drops.",
    ],
  },
  {
    version: "0.8.0",
    date: "2026-08-05",
    notes: [
      "Share buttons on profiles, jobs, and finished work — post to WhatsApp, X, Facebook, or copy a link.",
      "Rich link previews: shared links now show a proper card with an image and the Ganyu Hub logo.",
      "Email confirmation on sign-up, so accounts are tied to a real inbox.",
      "Human-verification (CAPTCHA) on sign-in, sign-up, and job invite links.",
    ],
  },
  {
    version: "0.7.0",
    date: "2026-08-05",
    notes: [
      "Job progress bar — see at a glance which stage a job is at, from hired to delivered.",
      "Clearer money summary on each job, including what the creative takes home after fees.",
      "Invite a client with a private link: set up their job for them and send it over.",
    ],
  },
];

export const VERSION = RELEASES[0].version;
