#!/usr/bin/env node
// Read-only category audit. Lists every distinct category value across jobs and
// profiles.categories, and flags anything outside the canonical six.
// Usage: SUPABASE_SERVICE_ROLE_KEY=... node scripts/audit-categories.mjs
// Exits 1 if any non-canonical value is found (assertable in CI / after reseed).

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

// Keep in sync with CATEGORIES in lib/types.ts.
const CANONICAL = new Set(["Design", "Development", "Video & Photography", "Content Creation", "Writing", "Marketing"]);

function tally(values) {
  const counts = new Map();
  for (const v of values) counts.set(v, (counts.get(v) || 0) + 1);
  return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0]));
}

function report(label, rows) {
  console.log(`\n${label}:`);
  const bad = [];
  for (const [value, n] of rows) {
    const ok = CANONICAL.has(value);
    console.log(`  ${ok ? "✓" : "✗"} ${JSON.stringify(value)}  (${n})`);
    if (!ok) bad.push(value);
  }
  if (!rows.length) console.log("  (none)");
  return bad;
}

const { data: jobs, error: jErr } = await sb.from("jobs").select("category");
if (jErr) throw jErr;
const { data: profiles, error: pErr } = await sb.from("profiles").select("categories");
if (pErr) throw pErr;

const jobCats = (jobs || []).map((j) => j.category).filter((c) => c != null);
const profileCats = (profiles || []).flatMap((p) => p.categories || []).filter((c) => c != null);

const badJobs = report("jobs.category", tally(jobCats));
const badProfiles = report("profiles.categories", tally(profileCats));

const bad = [...new Set([...badJobs, ...badProfiles])];
if (bad.length) {
  console.log(`\n✗ Non-canonical values found: ${bad.map((v) => JSON.stringify(v)).join(", ")}`);
  process.exit(1);
}
console.log("\n✓ All category values are canonical.");
