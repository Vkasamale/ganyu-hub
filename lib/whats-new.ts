// Public, user-facing release notes shown in the footer version badge.
// PURPOSELY CURATED — this is NOT CHANGELOG.md. Keep it friendly and product-
// facing; never mention security internals, RLS, schema/DB steps, or anything
// that hands an attacker a map. Newest first; VERSION = the top entry.
export type Release = { version: string; date: string; notes: string[] };

export const RELEASES: Release[] = [
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
