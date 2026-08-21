// Public, user-facing release notes shown in the footer version badge.
// PURPOSELY CURATED — this is NOT CHANGELOG.md. Keep it friendly and product-
// facing; never mention security internals, RLS, schema/DB steps, or anything
// that hands an attacker a map. Newest first; VERSION = the top entry.
export type Release = { version: string; date: string; notes: string[] };

export const RELEASES: Release[] = [
  {
    version: "0.9.15",
    date: "2026-08-21",
    notes: [
      "Ganyu Hub has a new look. The warm cream background is gone — pages are white now, cards sit just off-white on top of them, and everything is quieter so the work and the money stand out.",
      "The money stamp on a job is now proper pressed ink rather than a rounded label. Each of the five stages has its own colour, and once a job is paid out you can see both stamps together with the dates.",
      "The front page carries photographs of Malawi behind the search.",
      "On a computer, the payment box on a job now follows you down the page instead of scrolling out of sight.",
      "Your conversations show what the money on each job is doing, so you can tell at a glance which thread is about money already held.",
      "Creatives see what is held for them in escrow and what has been paid out, at the top of their home page.",
      "Empty pages now say plainly that nothing has happened yet, instead of looking broken.",
    ],
  },
  {
    version: "0.9.13",
    date: "2026-08-13",
    notes: [
      "On a phone there is now a bar along the bottom to move around with — home, finding work, messages and your jobs — so you are never hunting through a menu in the corner.",
      "Posting a job is three short steps instead of one long form. It guesses the category from your title, shows you exactly how creatives will see the job before you post, and you can save and finish later.",
      "You can use bold text and bullet points when describing a job.",
      "Work with several pictures now swipes through them properly, and tells you how many there are.",
      "Messages show whether the other person has opened your last one, and files arrive as proper cards with View and Save.",
      "Creatives we have checked ourselves now carry a badge saying so.",
      "Every profile ends with a short “get to know” section — where they are, what they speak, how much time they have.",
    ],
  },
  {
    version: "0.9.12",
    date: "2026-08-13",
    notes: [
      "Signing in now takes you to your own home page — what happened while you were away, the jobs you have running and whose turn it is, then work and people worth a look. Your numbers moved to the dashboard, where you can go and look at them whenever you want.",
      "Categories now say what they are for. “Get a logo, poster or menu designed” rather than “Design”.",
      "Every category has its own page, so you can send someone straight to the photographers or the tailors.",
      "Not sure what to call the style you want? Pick the picture closest to it and we will show you creatives who work that way.",
      "Job pages show what is really happening on a job before you spend an evening writing a proposal — how many people have applied, whether anyone was invited directly, and when the client was last here.",
      "Job cards show whether a client has actually paid into escrow before, and how often they hire.",
      "You can hide a job you are not interested in, and pick up browsing where you left off — or clear that history in one click.",
    ],
  },
  {
    version: "0.9.5",
    date: "2026-08-12",
    notes: [
      "Reviews now rate three things instead of one — clients rate quality, communication and deadlines; creatives rate whether the brief was clear, whether they were paid on time, and whether revisions were fair.",
      "If someone reviews you, you can reply once, publicly, under what they wrote. Nobody can edit anyone else’s words.",
      "Job pages show what creatives said about the client before you decide to bid.",
      "Each review now shows which job it was for and what was paid.",
      "Both sides get a nudge to leave a review the moment payment is released.",
    ],
  },
  {
    version: "0.9.3",
    date: "2026-08-12",
    notes: [
      "Job pages now tell you about the client before you bid — how many jobs they have posted, how often they actually hire, what they have paid through escrow, and whether they have funded a job before.",
      "Clients new to Ganyu Hub are labelled as new rather than left blank, so you know what you are looking at either way.",
      "Every figure on your Payments page now has a “?” explaining exactly what it means and which charges apply.",
    ],
  },
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
