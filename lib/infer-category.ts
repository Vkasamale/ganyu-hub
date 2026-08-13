import { CATEGORIES } from "@/lib/types";

/**
 * Item 67 (§I3) — guess the category from the job title.
 *
 * The old form opened with a 24-option dropdown defaulted to "Design", which
 * meant a client who never touched it silently posted a bakery sign-writing
 * job under Design. Asking someone to classify their own work in our taxonomy
 * is asking them to do our filing.
 *
 * So: they type "logo for my bakery", we say "Sounds like Design" and let them
 * change it. The guess is always VISIBLE and always overridable — §I3's
 * browse-all escape hatch. We never file it silently.
 *
 * ponytail: a keyword map, not a classifier. Every term here is a word a
 * Malawian client would actually type, local ones included (chitenje, nsima,
 * chichewa). When it does not know it says so rather than guessing Design — a
 * confident wrong answer costs more than an honest blank.
 */
const KEYWORDS: Record<string, string[]> = {
  Design: ["logo", "poster", "flyer", "brand", "branding", "menu", "banner", "label", "packaging", "business card", "signage", "sign", "billboard", "t-shirt", "tshirt", "graphic", "leaflet", "brochure"],
  Development: ["website", "web site", "app", "application", "software", "code", "wordpress", "shopify", "api", "backend", "frontend", "database", "system", "portal", "e-commerce", "ecommerce", "bot"],
  "Video & Photography": ["video", "photo", "photograph", "photographer", "shoot", "filming", "film", "camera", "wedding", "drone", "footage", "videographer", "portrait", "headshot"],
  "Content Creation": ["social media", "instagram", "facebook", "tiktok", "content", "reels", "posts", "influencer", "caption"],
  Writing: ["write", "writing", "writer", "article", "blog", "copy", "copywriting", "cv", "resume", "speech", "script", "proofread"],
  Marketing: ["marketing", "advert", "advertising", "campaign", "seo", "ads", "promotion", "promote", "brand strategy"],
  "Data & Analytics": ["data analysis", "analytics", "dashboard", "statistics", "survey analysis", "power bi", "visualisation", "visualization"],
  "Data Entry & Admin": ["data entry", "typing", "admin", "spreadsheet", "excel", "filing", "virtual assistant", "capture"],
  "Translation & Transcription": ["translate", "translation", "transcribe", "transcription", "chichewa", "tumbuka", "subtitle", "interpret"],
  "Audio & Music": ["music", "song", "record", "recording", "beat", "jingle", "voiceover", "voice over", "audio", "podcast", "mixing", "mastering", "dj"],
  "Animation & Motion": ["animation", "animate", "motion", "explainer", "cartoon", "intro"],
  "IT & Networking": ["computer", "laptop", "network", "wifi", "server", "it support", "install windows", "repair pc", "cctv", "printer"],
  "Product & UX": ["ux", "ui", "user experience", "wireframe", "prototype", "figma", "usability", "app design"],
  "Tutoring & Training": ["tutor", "teach", "training", "lessons", "coaching", "course", "workshop", "exam"],
  "Business & Consulting": ["business plan", "consult", "strategy", "pitch deck", "market research", "feasibility", "grant"],
  "Fashion & Tailoring": ["tailor", "sew", "sewing", "dress", "suit", "uniform", "chitenje", "fashion", "clothing", "alteration", "garment"],
  "Events & Entertainment": ["event", "wedding planner", "mc", "master of ceremonies", "party", "decor", "conference", "performer"],
  "Finance & Accounting": ["accounting", "accountant", "bookkeeping", "tax", "audit", "payroll", "invoice", "financial"],
  "Legal & Compliance": ["legal", "lawyer", "contract", "agreement", "company registration", "compliance", "trademark"],
  "Sales & Customer Support": ["sales", "customer service", "call centre", "call center", "telesales", "support agent", "lead generation"],
  "Health & Wellness": ["fitness", "gym", "nutrition", "diet", "therapy", "wellness", "personal trainer"],
  "Engineering & Architecture": ["architect", "engineer", "building plan", "structural", "cad", "construction", "floor plan", "boq"],
  "Crafts & Handmade": ["handmade", "craft", "carving", "beads", "jewellery", "jewelry", "pottery", "weaving", "basket", "furniture"],
  // No "bakery" or "restaurant": those name the CLIENT, not the job. "Logo
  // for my bakery" is a design job, and filing it under food was the exact
  // confident-wrong-answer this function is supposed to avoid.
  "Agriculture & Food": ["farm", "farming", "agriculture", "crop", "livestock", "poultry", "irrigation", "catering", "cook", "nsima", "maize"],
};

/**
 * Best-guess category, or null when nothing matches.
 *
 * EARLIEST match wins, ties broken by the longer keyword. People name the
 * thing they want first and the context after — "Logo for my bakery", "Video
 * for our church", "Website for the school". Ranking by keyword length alone
 * got that backwards and filed a logo job under Agriculture & Food.
 *
 * Length still breaks ties at the same position, so "app design" beats "app"
 * and "wedding planner" beats "wedding".
 */
export function inferCategory(title: string): string | null {
  const t = ` ${title.toLowerCase().trim()} `;
  if (t.trim().length < 3) return null;

  let best: { category: string; at: number; len: number } | null = null;
  for (const [category, words] of Object.entries(KEYWORDS)) {
    for (const w of words) {
      const hits = [t.indexOf(` ${w} `), t.indexOf(` ${w}s `)].filter((i) => i >= 0);
      if (!hits.length) continue;
      const at = Math.min(...hits);
      if (!best || at < best.at || (at === best.at && w.length > best.len)) {
        best = { category, at, len: w.length };
      }
    }
  }

  // Guard against a category since renamed out of CATEGORIES.
  if (best && (CATEGORIES as readonly string[]).includes(best.category)) return best.category;
  return null;
}
