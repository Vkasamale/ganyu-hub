// Server-side Cloudflare Turnstile verification. Fails OPEN when
// TURNSTILE_SECRET_KEY is unset so the current deployment keeps working until
// you add the key; once set, a missing/invalid token is rejected.
export async function verifyTurnstile(token: string | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // not configured yet
  if (!token) return false;
  try {
    const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
    });
    const data = await r.json();
    return data?.success === true;
  } catch {
    return false; // network/parse failure with a configured secret → reject
  }
}
