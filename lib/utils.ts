import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Every user is in Malawi (UTC+2); Vercel renders in UTC. Any date or number
// formatted with the *runtime default* locale/timezone therefore comes out
// differently on the server than in the browser. That's two bugs in one: users
// near midnight see the wrong day, AND React sees a hydration mismatch and
// throws away hydration for the whole subtree — which silently kills every
// button inside it (BUG-008). Pin locale and timezone explicitly, always.
const LOCALE = "en-GB";
const TZ = "Africa/Blantyre";

export function formatMwk(amount: number | null | undefined) {
  if (amount == null) return "—";
  // "en-MW" isn't present in every ICU build, so Node and the browser could
  // fall back to different grouping. en-GB is universal and groups identically.
  return `MWK ${amount.toLocaleString(LOCALE)}`;
}

export function formatDeadline(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const day = date.getDate();
  const month = date.toLocaleString("en-GB", { month: "long" });
  const suffix = day % 10 === 1 && day !== 11 ? "st"
    : day % 10 === 2 && day !== 12 ? "nd"
    : day % 10 === 3 && day !== 13 ? "rd" : "th";
  return `${day}${suffix} of ${month} ${y}`;
}

// "Today" in Malawi, as YYYY-MM-DD. Using the runtime's local midnight instead
// would put the server (UTC) a day ahead/behind the browser (UTC+2) for two
// hours every evening — wrong deadline counts, and a hydration mismatch.
function todayInMalawi(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function daysUntil(dateStr: string) {
  const toUtcMidnight = (s: string) => {
    const [y, m, d] = s.split("-").map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((toUtcMidnight(dateStr) - toUtcMidnight(todayInMalawi())) / 86400000);
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(LOCALE, { timeZone: TZ });
}

// "Member since August 2026". Pinned for the same reason as everything else:
// an unpinned locale renders the month in the browser's language, and an
// unpinned timezone can land on the wrong month entirely near a boundary.
export function formatMonthYear(iso: string) {
  return new Date(iso).toLocaleDateString(LOCALE, {
    timeZone: TZ,
    month: "long",
    year: "numeric",
  });
}

export function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return formatDate(iso);
}
