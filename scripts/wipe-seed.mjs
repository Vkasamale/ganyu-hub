#!/usr/bin/env node
// Destructive: deletes every seed auth user (email like %@seed.ganyu.local).
// Cascades to their profiles/jobs/services/proposals/reviews via FK.
// Usage: SUPABASE_SERVICE_ROLE_KEY=... node scripts/wipe-seed.mjs
// Guard: pass --yes to actually delete; without it, dry-runs and only counts.

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
const SUFFIX = "@seed.ganyu.local";

const victims = [];
for (let page = 1; ; page++) {
  const { data, error } = await sb.auth.admin.listUsers({ page, perPage: 1000 });
  if (error) throw error;
  const users = data?.users || [];
  for (const u of users) if (u.email && u.email.endsWith(SUFFIX)) victims.push(u);
  if (users.length < 1000) break;
}

console.log(`Found ${victims.length} seed users (email ending ${SUFFIX}).`);
if (!DO_IT) {
  console.log("Dry run — pass --yes to delete them.");
  process.exit(0);
}
let deleted = 0;
for (const u of victims) {
  const { error } = await sb.auth.admin.deleteUser(u.id);
  if (error) throw error;
  deleted++;
  process.stdout.write(".");
}
console.log(`\nDeleted ${deleted} seed users.`);
