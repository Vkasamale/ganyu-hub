#!/usr/bin/env node
// Backfill jobs.accepted_bid_mwk from the accepted proposal's bid for jobs that
// were accepted before the column existed. Dry-run by default; pass --yes to write.
// Requires the accepted_bid_mwk column (re-run supabase/schema.sql first).
// Usage: node scripts/backfill-accepted-bid.mjs [--yes]

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

// Jobs missing an agreed amount.
const { data: jobs, error: jErr } = await sb.from("jobs").select("id, accepted_bid_mwk").is("accepted_bid_mwk", null);
if (jErr) throw jErr;

let changes = 0;
for (const j of jobs || []) {
  const { data: prop, error: pErr } = await sb
    .from("proposals")
    .select("bid_mwk")
    .eq("job_id", j.id)
    .eq("status", "accepted")
    .limit(1)
    .maybeSingle();
  if (pErr) throw pErr;
  if (!prop) continue; // still open / no accepted proposal — leave null, money.ts falls back to budget_mwk
  console.log(`job ${j.id}: accepted_bid_mwk -> ${prop.bid_mwk}`);
  changes++;
  if (DO_IT) {
    const { error } = await sb.from("jobs").update({ accepted_bid_mwk: prop.bid_mwk }).eq("id", j.id);
    if (error) throw error;
  }
}

console.log(`\n${DO_IT ? "Applied" : "Would apply"} ${changes} change(s).`);
if (!DO_IT) console.log("Dry run — pass --yes to write.");
