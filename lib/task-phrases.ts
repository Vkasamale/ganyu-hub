import type { CATEGORIES } from "@/lib/types";

type Category = (typeof CATEGORIES)[number];

/**
 * Item 43 (§L1) — task phrasing for the category grid.
 *
 * A Malawian shop owner does not know they want "Graphics & Design". They know
 * they want a logo for their bakery. CATEGORIES is a taxonomy for us, not an
 * entry point for them — so the task phrase leads and the category name is
 * demoted to a subtitle. The link target is unchanged: still the category.
 *
 * ponytail: a literal map, not a database table. These change only when
 * CATEGORIES changes, which is a code change anyway.
 */
const PHRASES: Record<Category, string> = {
  Design: "Get a logo, poster or menu designed",
  Development: "Build a website or app",
  "Video & Photography": "Film or photograph something",
  "Content Creation": "Get posts made for social media",
  Writing: "Have something written for you",
  Marketing: "Get more people to find your business",
  "Data & Analytics": "Make sense of your numbers",
  "Data Entry & Admin": "Hand off the paperwork",
  "Translation & Transcription": "Translate or type up a recording",
  "Audio & Music": "Record a jingle, voiceover or track",
  "Animation & Motion": "Bring a logo or advert to life",
  "IT & Networking": "Fix computers, wifi or systems",
  "Product & UX": "Make an app easier to use",
  "Tutoring & Training": "Learn a skill or train your staff",
  "Business & Consulting": "Get advice on running the business",
  "Fashion & Tailoring": "Have clothing made or altered",
  "Events & Entertainment": "Plan or perform at an event",
  "Finance & Accounting": "Sort out books, tax or payroll",
  "Legal & Compliance": "Get contracts and registration handled",
  "Sales & Customer Support": "Get help selling or answering customers",
  "Health & Wellness": "Work with a coach or practitioner",
  "Engineering & Architecture": "Get plans or drawings done",
  "Crafts & Handmade": "Commission something handmade",
  "Agriculture & Food": "Get help with farming or food",
};

/** Null for a category with no phrase — the caller falls back to the name. */
export function taskPhrase(category: string): string | null {
  return PHRASES[category as Category] ?? null;
}
