#!/usr/bin/env node
// Seed script for Ganyu Hub. Admin-creates stub auth users (service role required),
// lets the on_auth_user_created trigger materialise profiles, then fills the rest.
// Usage: SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed.mjs

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnvLocal() {
  try {
    const txt = readFileSync(resolve(__dirname, "..", ".env.local"), "utf8");
    for (const line of txt.split(/\r?\n/)) {
      const m = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
      if (!m) continue;
      const k = m[1];
      let v = m[2].trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      if (!process.env[k]) process.env[k] = v;
    }
  } catch {}
}
loadEnvLocal();

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const sb = createClient(URL, KEY, { auth: { autoRefreshToken: false, persistSession: false } });

let seed = 0xC0FFEE;
function rand() { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 0xffffffff; }
function pick(arr) { return arr[Math.floor(rand() * arr.length)]; }
function sample(arr, n) { const a = [...arr]; const out = []; for (let i = 0; i < n && a.length; i++) out.push(a.splice(Math.floor(rand() * a.length), 1)[0]); return out; }
function int(min, max) { return Math.floor(min + rand() * (max - min + 1)); }

const FIRST = ["Chimwemwe","Tadala","Kondwani","Mercy","Brighton","Liness","Isaac","Grace","Tiyamike","Yamikani","Limbani","Madalitso","Tamandani","Chisomo","Mphatso","Tionge","Ndaziona","Pemphero","Lusungu","Atupele","Thoko","Blessings","Patience","Wongani","Symon","Esther","Joseph","Lovemore","Frank","Beatrice"];
const LAST = ["Banda","Phiri","Mwale","Chirwa","Kalua","Tembo","Nyirenda","Mkandawire","Chisale","Gondwe","Mhango","Kachale","Nyasulu","Chinkhuntha","Kayira","Manda","Lungu","Msiska","Kumwenda","Nthala"];
const CITIES = [...Array(8).fill("Blantyre"), ...Array(8).fill("Lilongwe"), ...Array(4).fill("Mzuzu")];

const ROLES = [
  ...Array(6).fill("Design"),
  ...Array(5).fill("Development"),
  ...Array(4).fill("Photography"),
  ...Array(3).fill("Writing"),
  ...Array(2).fill("Marketing"),
];

const SKILLS = {
  Design: ["Logo design","Brand identity","Illustration","Adobe Illustrator","Figma","Print layout","Packaging","Typography"],
  Development: ["React","Next.js","WordPress","Node.js","Tailwind CSS","PostgreSQL","Mobile UI","Shopify"],
  Photography: ["Portrait","Product","Event coverage","Lightroom","Studio lighting","Drone","Real estate"],
  Writing: ["Copywriting","Long-form articles","Editing","Press releases","Social copy","SEO"],
  Marketing: ["Social strategy","Meta Ads","Email campaigns","Content calendars","Analytics"],
};

const HEADLINES = {
  Design: ["Brand designer helping Malawian SMEs stand out","Identity & packaging designer based in $CITY","Logo and brand systems for growing teams"],
  Development: ["Full-stack developer building African web products","Next.js + Supabase developer in $CITY","WordPress sites for NGOs and small businesses"],
  Photography: ["Wedding and event photographer covering $CITY","Product photographer for online sellers","Portraits, products, and editorial in $CITY"],
  Writing: ["Copywriter for healthcare and development orgs","Editor and content writer in $CITY","Press releases and long-form for Malawian brands"],
  Marketing: ["Social and paid media for Malawian SMEs","Content strategist for NGOs in $CITY"],
};

const BIOS = {
  Design: "Brand and print designer with seven years working with Malawian SMEs, fintechs, and NGOs. I build identity systems that look professional and run on small budgets. Past work includes packaging for FMCG brands and pitch decks for development partners.",
  Development: "Web and mobile developer based in $CITY. I ship production sites and dashboards using Next.js, Supabase, and Tailwind. Past clients include health-tech startups and microfinance teams in Lilongwe and Blantyre.",
  Photography: "Editorial and commercial photographer covering events, products, and portraits across $CITY and beyond. I bring my own lighting and turn around galleries within a week. Past work spans NGO field stories, restaurant menus, and graduation ceremonies.",
  Writing: "Copywriter and editor with a background in development reporting. I write web copy, blog posts, and grant-friendly case studies in clear, plain English. Past clients include NGOs, two banks, and a regional health programme.",
  Marketing: "Social and content marketer working with $CITY brands and NGOs. I plan calendars, run Meta and Google Ads, and report on what's actually moving the needle. Comfortable in both English and Chichewa-led campaigns.",
};

const SERVICES_BY_CAT = {
  Design: [
    { title: "Logo design", desc: "Full logo concept with 2 revision rounds, delivered as SVG + PNG.", min: 25000, max: 90000, days: [4,8] },
    { title: "Brand identity pack", desc: "Logo, colour palette, type system, and a one-page brand guide.", min: 60000, max: 150000, days: [7,14] },
    { title: "Social media graphics", desc: "10 ready-to-post graphics in your brand colours.", min: 30000, max: 70000, days: [4,7] },
    { title: "Flyer / poster design", desc: "Print-ready A5 or A4 flyer with one round of revisions.", min: 25000, max: 55000, days: [2,5] },
    { title: "UI mockup", desc: "Figma mockup of a landing page or app screen, fully responsive.", min: 45000, max: 120000, days: [5,10] },
  ],
  Development: [
    { title: "Landing page", desc: "Single-page marketing site built in Next.js with a contact form.", min: 80000, max: 180000, days: [5,10] },
    { title: "WordPress site", desc: "5-page WordPress site with theme setup, contact form, and basic SEO.", min: 120000, max: 280000, days: [7,14] },
    { title: "E-commerce store", desc: "Shopify or WooCommerce store with up to 20 products and payment setup.", min: 200000, max: 500000, days: [10,14] },
    { title: "Mobile app UI", desc: "Front-end build of a React Native screen set wired to your API.", min: 180000, max: 450000, days: [10,14] },
    { title: "Custom web app feature", desc: "Add a feature to an existing app (auth, dashboard, payments).", min: 150000, max: 400000, days: [7,14] },
  ],
  Photography: [
    { title: "Product photography", desc: "Up to 20 edited product shots on white or lifestyle background.", min: 30000, max: 90000, days: [3,7] },
    { title: "Event coverage", desc: "Half-day event coverage with edited gallery delivered within 5 days.", min: 60000, max: 120000, days: [3,7] },
    { title: "Portrait session", desc: "1-hour studio or outdoor session, 15 edited portraits.", min: 35000, max: 80000, days: [3,5] },
    { title: "Real estate photos", desc: "Interior and exterior shots for a single property listing.", min: 40000, max: 100000, days: [2,5] },
  ],
  Writing: [
    { title: "Blog article", desc: "800–1200 word researched article in your tone of voice.", min: 15000, max: 45000, days: [3,7] },
    { title: "Copy editing", desc: "Edit up to 3000 words for clarity, tone, and grammar.", min: 18000, max: 40000, days: [2,5] },
    { title: "Social media content pack", desc: "20 captions and a posting calendar for one month.", min: 25000, max: 55000, days: [4,7] },
    { title: "Press release", desc: "One press release written and formatted for distribution.", min: 20000, max: 50000, days: [3,5] },
  ],
  Marketing: [
    { title: "Monthly social management", desc: "Calendar, posting, and a short monthly report.", min: 80000, max: 180000, days: [7,14] },
    { title: "Paid ads setup", desc: "Meta + Google Ads account setup with two campaigns.", min: 60000, max: 140000, days: [4,7] },
    { title: "Content strategy session", desc: "Two workshops and a 4-week content plan.", min: 50000, max: 120000, days: [5,10] },
  ],
};

const CLIENT_NAMES = [
  "Mphatso Banda","Towera Chirwa","Steve Kanyenda","Limbani Mwale","Patrick Gondwe",
  "Faith Phiri","Daniel Nyirenda","Mary Kalua","Joseph Mhango","Ruth Tembo",
];
const CLIENT_ORG_HINTS = [
  "for Lilongwe Health Trust","for Mzuzu Coffee Co-op","for Blantyre Sports Academy",
  "for a new restaurant in Area 47","for an SME mobile-money product",
  "for a community radio station","for a regional NGO health campaign",
  "for a Lilongwe-based fintech startup","for a Blantyre property agency",
  "for a women's micro-finance group",
];

const JOB_TEMPLATES = [
  { title: "Logo design for new Blantyre restaurant", category: "Design", brief: "We're opening a casual dining spot in Blantyre and need a warm, memorable logo that works on signage, menus, and Instagram. Looking for two concepts to choose from.", budget: [60000,120000] },
  { title: "Website for Lilongwe-based NGO", category: "Development", brief: "5-page WordPress or Next.js site for a maternal-health NGO. Needs a programmes page, donation link, and contact form. Bilingual (English + Chichewa) preferred.", budget: [180000,350000] },
  { title: "Social media content for mobile money product", category: "Marketing", brief: "Monthly social content for a mobile-money product targeting small traders. 20 posts plus a calendar. Familiarity with Malawian SME audiences is a plus.", budget: [120000,220000] },
  { title: "Photography for school graduation ceremony", category: "Photography", brief: "Coverage of a secondary-school graduation in Mzuzu. Group portraits plus candid moments. Edited gallery within one week.", budget: [70000,110000] },
  { title: "Copywriter for government health campaign", category: "Writing", brief: "Three short articles and one explainer for a public-health awareness campaign. Clear, plain English. Pre-existing brief and brand voice will be shared.", budget: [60000,130000] },
  { title: "Brand identity for women-led coffee co-op", category: "Design", brief: "Need a brand identity (logo, palette, type, one-pager) for a Mzuzu coffee co-operative going to market this quarter. Should feel modern but rooted in place.", budget: [120000,250000] },
  { title: "Product photography for online seller", category: "Photography", brief: "Around 40 product shots for an online clothing store. White-background plus 5 lifestyle setups. Studio or on-location, you tell us.", budget: [80000,160000] },
  { title: "Landing page for SaaS pilot", category: "Development", brief: "Single-page marketing site for a logistics SaaS pilot. Needs a hero, three feature blocks, pricing, and a waitlist form connected to email.", budget: [120000,220000] },
  { title: "Edit and polish 12 blog articles", category: "Writing", brief: "Twelve drafts (around 1000 words each) need editing for tone, clarity, and structure. Two-week turnaround.", budget: [80000,160000] },
  { title: "Flyer + poster set for music festival", category: "Design", brief: "A4 poster, A5 flyer, and three Instagram variants for a one-day festival in Lilongwe. Bold and a bit chaotic, we trust your judgement.", budget: [55000,110000] },
  { title: "E-commerce store for boutique", category: "Development", brief: "Shopify build for a Blantyre boutique. ~25 products, mobile-first, Airtel + TNM Mpamba payments preferred.", budget: [250000,500000] },
  { title: "Event coverage — fintech launch", category: "Photography", brief: "Evening launch event in Lilongwe. Need portrait + candid coverage, 60 edited images delivered within 4 days.", budget: [90000,160000] },
  { title: "Press release — funding announcement", category: "Writing", brief: "One press release announcing a Series A round for a Malawian agri-tech startup. Investor-friendly tone.", budget: [40000,80000] },
  { title: "Meta Ads setup for school recruitment", category: "Marketing", brief: "Set up and run a 2-week Meta ad campaign for a private secondary school's January intake. Targeting parents in Lilongwe.", budget: [80000,160000] },
  { title: "App UI for community savings group", category: "Design", brief: "Mobile UI mockups (Figma) for a community savings app: onboarding, dashboard, contribute, payout. Five screens, mobile first.", budget: [120000,240000] },
];

const COVERS = [
  "I've shipped similar projects for $CITY clients and can hit your timeline comfortably. Happy to share two relevant samples on a quick call.",
  "Your brief lines up well with what I do most weeks. I can start within three days and keep the back-and-forth tight so we don't lose time.",
  "I read the brief carefully — the bit about $HOOK is exactly the kind of thing I enjoy untangling. Bid is firm, includes one round of revisions.",
  "Have done two near-identical jobs in the last quarter. I'd lead with a quick discovery call, share a short mood deck, then move into delivery.",
];
const HOOKS = ["the audience","the bilingual angle","the timeline","the SME focus","the print constraints","mobile-first delivery"];

const REVIEW_COMMENTS = [
  "Delivered exactly what we needed for our $ORG rebrand. Very professional.",
  "Clear communication and finished ahead of schedule. Would hire again.",
  "Excellent work — the team loved the final result. Worth every kwacha.",
  "Smooth process from kickoff to handover. Files were well organised.",
  "Patient with our feedback rounds and the end result speaks for itself.",
];

async function adminCreate(email, fullName, role) {
  const { data, error } = await sb.auth.admin.createUser({
    email,
    password: Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2),
    email_confirm: true,
    user_metadata: { full_name: fullName, role },
  });
  if (error) throw error;
  return data.user.id;
}
function tag(s, city, org) { return s.replaceAll("$CITY", city || "Malawi").replaceAll("$ORG", org || "client").replaceAll("$HOOK", pick(HOOKS)); }

async function main() {
  const batch = Date.now().toString(36);
  console.log(`Seeding batch ${batch}…`);

  console.log("Creating 20 creative profiles…");
  const creatives = [];
  const usedNames = new Set();
  for (let i = 0; i < 20; i++) {
    let first, last, full;
    do { first = pick(FIRST); last = pick(LAST); full = `${first} ${last}`; } while (usedNames.has(full));
    usedNames.add(full);
    const category = ROLES[i];
    const city = pick(CITIES);
    const email = `${first.toLowerCase()}.${last.toLowerCase()}.${batch}@seed.ganyu.local`;
    const id = await adminCreate(email, full, "creative");
    const headline = tag(pick(HEADLINES[category]), city);
    const bio = tag(BIOS[category], city);
    const skills = sample(SKILLS[category], int(3, 6));
    const { error } = await sb.from("profiles").update({
      headline, bio,
      location: city,
      categories: [category],
      skills,
      onboarded_at: new Date().toISOString(),
    }).eq("id", id);
    if (error) throw error;
    creatives.push({ id, name: full, category, city });
    process.stdout.write(".");
  }
  console.log(`  done (${creatives.length})`);

  console.log("Creating services…");
  const serviceRows = [];
  for (const cr of creatives) {
    const chosen = sample(SERVICES_BY_CAT[cr.category], int(2, 3));
    for (const s of chosen) {
      const price = int(s.min, s.max);
      const max = Math.round(price * (1.5 + rand() * 1.5));
      serviceRows.push({
        profile_id: cr.id, title: s.title, description: s.desc,
        price_mwk: price, price_mwk_max: max,
        delivery_days: int(s.days[0], s.days[1]),
      });
    }
  }
  const { error: svcErr } = await sb.from("services").insert(serviceRows);
  if (svcErr) throw svcErr;
  console.log(`  done (${serviceRows.length})`);

  console.log("Creating 10 client profiles…");
  const clients = [];
  for (let i = 0; i < 10; i++) {
    const full = CLIENT_NAMES[i];
    const [first, last] = full.toLowerCase().split(" ");
    const email = `client.${first}.${last}.${batch}@seed.ganyu.local`;
    const id = await adminCreate(email, full, "client");
    const city = pick(CITIES);
    const { error } = await sb.from("profiles").update({
      headline: `Hiring ${pick(CLIENT_ORG_HINTS)}`,
      location: city,
      onboarded_at: new Date().toISOString(),
    }).eq("id", id);
    if (error) throw error;
    clients.push({ id, name: full, city });
    process.stdout.write(".");
  }
  console.log(`  done (${clients.length})`);

  console.log("Creating 15 jobs…");
  const statusPlan = [...Array(10).fill("open"), ...Array(3).fill("in_progress"), ...Array(2).fill("completed")];
  const jobs = [];
  for (let i = 0; i < 15; i++) {
    const tpl = JOB_TEMPLATES[i % JOB_TEMPLATES.length];
    const client = pick(clients);
    const budget = int(tpl.budget[0], tpl.budget[1]);
    const status = statusPlan[i];
    const escrow = status === "completed" ? "payment_released" : status === "in_progress" ? "payment_held" : "none";
    const { data, error } = await sb.from("jobs").insert({
      client_id: client.id, title: tpl.title, brief: tpl.brief,
      budget_mwk: budget, category: tpl.category, status, escrow_status: escrow,
    }).select("id, category, budget_mwk, status, client_id").single();
    if (error) throw error;
    jobs.push(data);
    process.stdout.write(".");
  }
  console.log(`  done (${jobs.length})`);

  console.log("Creating proposals…");
  const proposalRows = [];
  const usedPairs = new Set();
  let made = 0;
  for (const j of jobs.filter((x) => x.status !== "open")) {
    const cands = creatives.filter((c) => c.category === j.category);
    const c = pick(cands.length ? cands : creatives);
    usedPairs.add(`${j.id}:${c.id}`);
    proposalRows.push({
      job_id: j.id, creative_id: c.id,
      cover_letter: tag(pick(COVERS), c.city),
      bid_mwk: Math.round(j.budget_mwk * (0.85 + rand() * 0.3)),
      status: "accepted",
    });
    made++;
  }
  const openJobs = jobs.filter((x) => x.status === "open");
  while (made < 20) {
    const j = pick(openJobs);
    const cands = creatives.filter((c) => c.category === j.category);
    const c = pick(cands.length ? cands : creatives);
    const key = `${j.id}:${c.id}`;
    if (usedPairs.has(key)) continue;
    usedPairs.add(key);
    proposalRows.push({
      job_id: j.id, creative_id: c.id,
      cover_letter: tag(pick(COVERS), c.city),
      bid_mwk: Math.round(j.budget_mwk * (0.85 + rand() * 0.3)),
      status: rand() < 0.7 ? "pending" : "declined",
    });
    made++;
  }
  const { error: propErr } = await sb.from("proposals").insert(proposalRows);
  if (propErr) throw propErr;
  console.log(`  done (${proposalRows.length})`);

  console.log("Creating reviews…");
  const acceptedByJob = new Map();
  for (const p of proposalRows.filter((p) => p.status === "accepted")) acceptedByJob.set(p.job_id, p.creative_id);

  const reviewRows = [];
  for (const j of jobs.filter((x) => x.status === "completed")) {
    const creativeId = acceptedByJob.get(j.id);
    if (!creativeId) continue;
    reviewRows.push({ job_id: j.id, reviewer_id: j.client_id, reviewee_id: creativeId, rating: rand() < 0.6 ? 5 : 4, comment: tag(pick(REVIEW_COMMENTS), null, "team") });
    reviewRows.push({ job_id: j.id, reviewer_id: creativeId, reviewee_id: j.client_id, rating: rand() < 0.7 ? 5 : 4, comment: "Great client. Clear brief, paid on time, would work with again." });
  }
  // bring total to 10 by promoting in_progress jobs to completed and reviewing them
  if (reviewRows.length < 10) {
    const need = Math.ceil((10 - reviewRows.length) / 2);
    const inProg = jobs.filter((j) => j.status === "in_progress").slice(0, need);
    for (const j of inProg) {
      await sb.from("jobs").update({ status: "completed", escrow_status: "payment_released" }).eq("id", j.id);
      const creativeId = acceptedByJob.get(j.id);
      if (!creativeId) continue;
      reviewRows.push({ job_id: j.id, reviewer_id: j.client_id, reviewee_id: creativeId, rating: rand() < 0.6 ? 5 : 4, comment: tag(pick(REVIEW_COMMENTS), null, "team") });
      reviewRows.push({ job_id: j.id, reviewer_id: creativeId, reviewee_id: j.client_id, rating: 5, comment: "Clear, respectful client and timely payment. Recommended." });
    }
  }
  const { error: revErr } = await sb.from("reviews").insert(reviewRows.slice(0, 10));
  if (revErr) throw revErr;
  console.log(`  done (${Math.min(reviewRows.length, 10)})`);

  console.log(`\nBatch tag: ${batch}`);
  console.log(`To wipe this batch:\n  delete from auth.users where email like '%.${batch}@seed.ganyu.local';`);
}

main().catch((e) => { console.error(e); process.exit(1); });
