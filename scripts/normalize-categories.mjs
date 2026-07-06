#!/usr/bin/env node
// One-shot: map legacy/aliased category values to the canonical six across
// jobs.category and profiles.categories. Dry-run by default; pass --yes to write.
// Anything with no known mapping is left untouched and reported (never guessed).
// Usage: node scripts/normalize-categories.mjs [--yes]

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
try {
  const txt = readFileSync(resolve(__dirname, "..", ".env.local"), "utf8");
  for (const line of txt.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (!process.env[m[1]]) process.env[m[1]] = v;
  }
} catch {}

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
const sb = createClient(URL, KEY, { auth: { autoRefreshToken: false, persistSession: false } });
const DO_IT = process.argv.includes("--yes");

const CANONICAL = new Set(["Design", "Development", "Video & Photography", "Content Creation", "Writing", "Marketing"]);
// Known aliases only. Unmapped non-canonical values are reported, not touched.
const ALIASES = {
  "Writing & Marketing": "Marketing",
  "Dev": "Development",
  "Developers": "Development",
  "Photography": "Video & Photography",
};
const map = (v) => (CANONICAL.has(v) ? v : ALIASES[v] ?? null);

let changes = 0;
const skipped = new Set();

// jobs.category (scalar)
const { data: jobs, error: jErr } = await sb.from("jobs").select("id, category");
if (jErr) throw jErr;
for (const j of jobs || []) {
  if (j.category == null || CANONICAL.has(j.category)) continue;
  const to = map(j.category);
  if (!to) { skipped.add(j.category); continue; }
  console.log(`job ${j.id}: ${JSON.stringify(j.category)} -> ${JSON.stringify(to)}`);
  changes++;
  if (DO_IT) {
    const { error } = await sb.from("jobs").update({ category: to }).eq("id", j.id);
    if (error) throw error;
  }
}

// profiles.categories (text[])
const { data: profiles, error: pErr } = await sb.from("profiles").select("id, categories");
if (pErr) throw pErr;
for (const p of profiles || []) {
  const cats = p.categories || [];
  if (!cats.some((c) => !CANONICAL.has(c))) continue;
  const next = [];
  for (const c of cats) {
    const to = map(c);
    if (!to) { skipped.add(c); next.push(c); continue; } // keep unknown as-is
    if (!next.includes(to)) next.push(to);
  }
  if (JSON.stringify(next) === JSON.stringify(cats)) continue;
  console.log(`profile ${p.id}: ${JSON.stringify(cats)} -> ${JSON.stringify(next)}`);
  changes++;
  if (DO_IT) {
    const { error } = await sb.from("profiles").update({ categories: next }).eq("id", p.id);
    if (error) throw error;
  }
}

console.log(`\n${DO_IT ? "Applied" : "Would apply"} ${changes} change(s).`);
if (skipped.size) console.log(`Unmapped (left untouched): ${[...skipped].map((v) => JSON.stringify(v)).join(", ")}`);
if (!DO_IT) console.log("Dry run — pass --yes to write.");
