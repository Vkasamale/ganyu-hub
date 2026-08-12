// Phase 5 item 37 (§I4) — category-specific attribute sets.
//
// A logo job and a photoshoot both have "how many" and "what files", but the
// words are not interchangeable. Asking a photographer for "concepts", or a
// designer for "edited photos", makes the form read as though it was written
// by someone who has never commissioned either.
//
// The NUMBER is stored generically (proposals.concepts); only the label lives
// here. Storing the label on every row would freeze today's wording into all
// of history and make it impossible to reword later.

export type DeliverableSpec = {
  /** What "how many" means for this kind of work. */
  unitLabel: string;
  unitHint: string;
  /** Formats worth offering as checkboxes. Free text stays allowed. */
  formats: string[];
  /** What "source files" means here — the single most disputed line item. */
  sourceLabel: string;
};

const DEFAULT_SPEC: DeliverableSpec = {
  unitLabel: "Items delivered",
  unitHint: "How many finished pieces the client receives",
  formats: ["PDF", "PNG", "JPG", "DOCX", "ZIP"],
  sourceLabel: "Editable source files included",
};

// Keyed by the exact strings in CATEGORIES (lib/types.ts). Anything unlisted
// falls back to DEFAULT_SPEC, so adding a category never breaks the form.
const BY_CATEGORY: Record<string, DeliverableSpec> = {
  Design: {
    unitLabel: "Concepts",
    unitHint: "How many distinct directions before revisions begin",
    formats: ["AI", "PSD", "SVG", "PDF", "PNG", "JPG", "Figma"],
    sourceLabel: "Editable source files (AI / PSD / Figma) included",
  },
  "Video & Photography": {
    unitLabel: "Final images or cuts",
    unitHint: "How many edited photos, or finished video cuts",
    formats: ["JPG", "PNG", "TIFF", "RAW", "MP4", "MOV", "ProRes"],
    sourceLabel: "RAW files or project file included",
  },
  "Animation & Motion": {
    unitLabel: "Finished cuts",
    unitHint: "How many rendered animations",
    formats: ["MP4", "MOV", "GIF", "Lottie/JSON", "AEP"],
    sourceLabel: "Project file (AEP / Blender) included",
  },
  Writing: {
    unitLabel: "Drafts",
    unitHint: "How many written drafts before revisions begin",
    formats: ["DOCX", "Google Doc", "Markdown", "PDF"],
    sourceLabel: "Editable document, not just a PDF, included",
  },
  "Content Creation": {
    unitLabel: "Pieces",
    unitHint: "How many posts, scripts or assets",
    formats: ["MP4", "JPG", "PNG", "DOCX", "PDF"],
    sourceLabel: "Editable source files included",
  },
  Development: {
    unitLabel: "Deliverables",
    unitHint: "What the client receives — a site, a build, a repo",
    formats: ["Git repository", "ZIP", "Deployed URL", "Documentation"],
    sourceLabel: "Full source code and repository access included",
  },
  "Product & UX": {
    unitLabel: "Screens or flows",
    unitHint: "How many designed screens or user flows",
    formats: ["Figma", "PDF", "PNG", "Prototype link"],
    sourceLabel: "Editable Figma file included",
  },
  "Audio & Music": {
    unitLabel: "Tracks",
    unitHint: "How many finished tracks or mixes",
    formats: ["WAV", "MP3", "AIFF", "Stems"],
    sourceLabel: "Stems or project session included",
  },
};

export function specFor(category: string | null | undefined): DeliverableSpec {
  return (category && BY_CATEGORY[category]) || DEFAULT_SPEC;
}

export type Addon = { label: string; price_mwk: number };

/**
 * Add-ons arrive as loose JSON from the database, so treat them as untrusted:
 * anything without a label and a positive price is dropped rather than
 * rendered as "undefined — MWK NaN".
 */
export function parseAddons(raw: unknown): Addon[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((a: any) => {
    const label = typeof a?.label === "string" ? a.label.trim() : "";
    const price = Number(a?.price_mwk);
    if (!label || !Number.isFinite(price) || price <= 0) return [];
    return [{ label: label.slice(0, 80), price_mwk: Math.round(price) }];
  });
}
