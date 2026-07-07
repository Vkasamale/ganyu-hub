# Deploy

Everything you need to get Ganyu Hub live on Vercel.

## The build

`npm run build` succeeds. Every route is server-rendered on demand (`ƒ Dynamic`), which is expected — Supabase auth uses cookies, so nothing pre-renders at build time. The `DYNAMIC_SERVER_USAGE` lines in the build output are Next.js telling itself this, not errors.

## Environment variables

Every variable the app reads at runtime, plus the ones the maintenance scripts need. Paste each one into Vercel exactly as described below.

### Required for the app to run

| Variable | What it does |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | The URL of your Supabase project — every page uses it to talk to the database. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | The public "anon" key that lets browsers talk to Supabase under row-level security. Safe to expose. |
| `APP_URL` | The public URL emails use to build clickable links back into the app. **See "APP_URL after launch" below.** |

### Required for outbound email (password resets, notifications)

| Variable | What it does |
|---|---|
| `RESEND_API_KEY` | Your Resend API key. Without it, `sendEmail` logs a warning and silently skips — the app runs, but no email leaves. |
| `EMAIL_FROM` | The verified From address, e.g. `Ganyu Hub <hello@ganyuhub.com>`. Falls back to Resend's sandbox address if unset, which only delivers to the account owner. |
| `EMAIL_REPLY_TO` | Optional. Reply-To header on outbound mail. Set it to the address you actually watch. |

### Required only for maintenance scripts (not the app)

Set these in Vercel too if you plan to run scripts from a Vercel deployment; otherwise they live in your local `.env.local` only.

| Variable | What it does |
|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Admin key used by `scripts/seed.mjs`, `scripts/wipe-seed.mjs`, `scripts/audit-categories.mjs`, `scripts/normalize-categories.mjs`, `scripts/backfill-accepted-bid.mjs`. **Never expose this in the browser or commit it.** |

## Where to paste them in Vercel

1. Go to https://vercel.com and open the Ganyu Hub project.
2. **Settings** (top nav) → **Environment Variables** (left sidebar).
3. For each variable above:
   - **Key**: the name from the table (e.g. `NEXT_PUBLIC_SUPABASE_URL`).
   - **Value**: paste the value.
   - **Environments**: tick **Production**, **Preview**, and **Development** (unless you want a different value per environment — e.g. a separate `APP_URL` for previews).
   - Click **Save**.
4. After adding or changing any variable, go to the **Deployments** tab and redeploy the latest production deployment (kebab menu → **Redeploy**). Env-var changes do not take effect until a new build runs.

## APP_URL after launch — plain answer

Right now `APP_URL` defaults to `http://localhost:3000`. That's fine locally. **In production it must be the public HTTPS URL where users actually visit the app**, with no trailing slash. Every email link is built as `${APP_URL}${path}`, so if this is wrong or missing, the reset-password button, "Open job" CTAs, and everything else in email will point at localhost and 404 for the recipient.

- **If you're on Vercel's default domain:** set `APP_URL` to `https://<your-project>.vercel.app`.
- **Once you point a custom domain at Vercel** (e.g. `ganyuhub.com`): change `APP_URL` to `https://ganyuhub.com` and redeploy. Do it the same day you switch the DNS, otherwise emails keep linking to the old vercel.app URL.
- **Preview deployments:** each preview gets its own URL. If you want preview emails to click through correctly, set a separate `APP_URL` for the Preview environment (Vercel lets you scope a value to Preview only). Or leave it pointing at production — safer for anything you'd rather not surface from a preview branch.

Do **not** include a trailing slash. `https://ganyuhub.com` — not `https://ganyuhub.com/`.

## Sanity check after deploy

1. Open the deployed URL in a browser and sign up with a real inbox.
2. Log out, hit **Forgot password**, submit your email.
3. Open the email. The reset button should point at `https://<your-domain>/reset-password?...`, not `localhost`.
4. If it still says localhost, `APP_URL` is missing or unset for Production — go back to step 3 in "Where to paste them" and redeploy.
