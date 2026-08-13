/**
 * Phase 6 item 50 (§O3) — the visual style vocabulary.
 *
 * §O3's argument: many clients here have never commissioned design and do not
 * have the words. "Flat vector" means nothing; a picture of it means
 * everything. Letting someone point is the difference between briefing us and
 * giving up.
 *
 * The slugs are stored in `profiles.styles` (supabase/phase6-styles.sql) and
 * are DECLARED BY THE CREATIVE, never inferred from their portfolio (§K2).
 *
 * ponytail: a plain array, not a table. Adding a style should be a one-line
 * code change, not a migration and a seed.
 */
export const STYLES = [
  { slug: "flat", label: "Flat & simple", hint: "Clean shapes, few colours" },
  { slug: "3d", label: "3D & shiny", hint: "Depth, shadow, gloss" },
  { slug: "hand-drawn", label: "Hand-drawn", hint: "Sketched, illustrated by hand" },
  { slug: "vintage", label: "Vintage", hint: "Old-style, worn, retro" },
  { slug: "photographic", label: "Photographic", hint: "Built around real photos" },
  { slug: "bold-type", label: "Big bold type", hint: "Words are the design" },
] as const;

export type StyleSlug = (typeof STYLES)[number]["slug"];

/**
 * Where a style question makes sense at all. Asking a tax accountant whether
 * their work is "vintage" is noise, and noise in a filter bar teaches people
 * to ignore the filter bar.
 */
export const VISUAL_CATEGORIES = [
  "Design",
  "Animation & Motion",
  "Video & Photography",
  "Crafts & Handmade",
] as const;

export function hasVisualCategory(categories: string[] | null | undefined): boolean {
  return (categories || []).some((c) => (VISUAL_CATEGORIES as readonly string[]).includes(c));
}

export function styleLabel(slug: string): string | null {
  return STYLES.find((s) => s.slug === slug)?.label ?? null;
}
