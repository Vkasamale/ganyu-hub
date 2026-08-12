// Public, user-facing release notes shown in the footer version badge.
// PURPOSELY CURATED — this is NOT CHANGELOG.md. Keep it friendly and product-
// facing; never mention security internals, RLS, schema/DB steps, or anything
// that hands an attacker a map. Newest first; VERSION = the top entry.
export type Release = { version: string; date: string; notes: string[] };

export const RELEASES: Release[] = [
  {
    version: "0.9.2",
    date: "2026-08-12",
    notes: [
      "Every button that moves money now says the amount on it — “Release MWK 20,000”, not “Release payment”.",
      "On a phone, the payment action follows you down the page instead of scrolling away.",
      "Conversations show how many messages are waiting, and the count clears when you open the thread.",
      "Portfolio pieces can carry what they cost, how long they took and when they shipped — so clients stop having to ask.",
      "Profiles gained a tagline, the languages you work in, and how many hours a week you can take on.",
      "You decide whether you are open to work and open for messages. We never guess it from when you were last online.",
      "Creative profiles are now split into About, Services, Portfolio and Reviews.",
      "Empty screens tell you what to do next instead of only saying there is nothing here.",
    ],
  },
  {
    version: "0.9.1.2",
    date: "2026-08-12",
    notes: [
      "A notice bar at the top of the site for anything worth announcing — starting with an honest one: Ganyu Hub is in beta. Close it and it stays closed until there's genuinely something new to say.",
    ],
  },
  {
    version: "0.9.1.1",
    date: "2026-08-12",
    notes: [
      "A one-line prompt at the top of the page showing you how to install Ganyu Hub on your phone — including on iPhone, where the browser can't do it for you. Dismiss it once and it stays gone.",
    ],
  },
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
