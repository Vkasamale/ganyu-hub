/**
 * Phase 7 (§A, §K1, §K3) — ONE list of destinations, feeding every shell.
 *
 * There were three shells drifting apart: two links in the header, thirteen
 * items in the account dropdown, and a sidebar. The dropdown had become where
 * the app actually lived, which is the one place nobody looks.
 *
 * Rules encoded here:
 *
 *  - **Verbs, not nouns (§K3).** "Find work" tells you what you get.
 *    "Dashboard" is a word for us, not for a tailor in Blantyre.
 *  - **Five tabs, and no create action among them (§A).** A "+" in a tab bar
 *    competes with the tab beside it and is the thing people hit by accident.
 *    Posting stays a deliberate button.
 *  - **Role decides wording, never capability.** A creative's "Find work" and
 *    a client's "Find someone" are the same slot; agencies do both, so they
 *    take the creative wording and keep posting.
 */

export type NavRole = "client" | "creative" | "agency" | null;

export type Dest = {
  href: string;
  label: string;
  /** Key into components/nav-icons.tsx. */
  icon: string;
  /** Match child routes too (e.g. /messages/<id>). */
  prefix?: boolean;
};

const isBuyer = (role: NavRole) => role === "client";

/**
 * The bottom-bar destinations (§A). The fifth slot is Menu, added by the bar
 * itself — four links plus the drawer.
 */
export function tabDestinations(role: NavRole): Dest[] {
  return [
    { href: "/", label: "Home", icon: "home" },
    isBuyer(role)
      ? { href: "/browse", label: "Find someone", icon: "search", prefix: true }
      : { href: "/jobs", label: "Find work", icon: "search", prefix: true },
    { href: "/messages", label: "Messages", icon: "message", prefix: true },
    { href: "/dashboard/jobs", label: "My work", icon: "briefcase", prefix: true },
  ];
}

/**
 * Desktop header, verb-phrased (§K3, item 60). Deliberately three: a header
 * that lists everything is a dropdown with extra steps.
 */
export function primaryDestinations(role: NavRole): Dest[] {
  return isBuyer(role)
    ? [
        { href: "/browse", label: "Find someone", icon: "search", prefix: true },
        { href: "/dashboard/jobs", label: "Manage work", icon: "briefcase", prefix: true },
        // "Money" was too generic for a link that lands on Payments — the
        // label should name the area, not the subject matter.
        { href: "/dashboard/payments", label: "Finances", icon: "wallet", prefix: true },
      ]
    : [
        { href: "/jobs", label: "Find work", icon: "search", prefix: true },
        { href: "/dashboard/jobs", label: "Deliver work", icon: "briefcase", prefix: true },
        { href: "/dashboard/payments", label: "Get paid", icon: "wallet", prefix: true },
      ];
}

/**
 * The drawer, grouped (§K1, item 57). Grouping is the point: thirteen flat
 * rows is a list you scan once and give up on.
 */
export function drawerGroups(role: NavRole, opts: { userId: string; isAdmin: boolean }) {
  const work: Dest[] = isBuyer(role)
    ? [
        { href: "/dashboard/jobs", label: "My jobs", icon: "briefcase", prefix: true },
        { href: "/dashboard/proposals", label: "Proposals received", icon: "inbox", prefix: true },
        { href: "/messages", label: "Messages", icon: "message", prefix: true },
        { href: "/dashboard/saved", label: "Saved creatives", icon: "bookmark" },
        { href: "/dashboard", label: "Your numbers", icon: "chart" },
      ]
    : [
        { href: "/dashboard/jobs", label: "My jobs", icon: "briefcase", prefix: true },
        { href: "/dashboard/proposals", label: "Proposals sent", icon: "inbox", prefix: true },
        { href: "/messages", label: "Messages", icon: "message", prefix: true },
        { href: "/dashboard/portfolio", label: "Portfolio", icon: "folder" },
        { href: "/dashboard/services", label: "Rate card", icon: "list" },
        { href: "/dashboard/saved", label: "Saved jobs", icon: "bookmark" },
        { href: "/dashboard", label: "Your numbers", icon: "chart" },
      ];

  const settings: Dest[] = [
    { href: "/dashboard/profile", label: "Edit profile", icon: "user" },
    { href: "/dashboard/account", label: "Account & security", icon: "shield" },
    { href: "/dashboard/payments", label: "Payments & payouts", icon: "wallet" },
    ...(isBuyer(role)
      ? []
      : [{ href: `/creatives/${opts.userId}`, label: "View public profile", icon: "external" }]),
  ];

  const help: Dest[] = [
    { href: "/how-money-works", label: "How the money works", icon: "help" },
    { href: "/dashboard/report", label: "Report a problem", icon: "flag" },
    { href: "/release-notes", label: "What's new", icon: "sparkle" },
  ];

  return [
    { title: "Your work", items: work },
    { title: "Settings", items: settings },
    { title: "Help", items: help },
    ...(opts.isAdmin
      ? [{ title: "Admin", items: [{ href: "/admin", label: "Admin", icon: "shield" }] }]
      : []),
  ];
}

/** Is `href` the current page? Prefix destinations match their children. */
export function isActive(pathname: string, d: Dest): boolean {
  if (d.href === "/") return pathname === "/";
  return d.prefix ? pathname === d.href || pathname.startsWith(d.href + "/") : pathname === d.href;
}
