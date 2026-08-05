"use client";

import Script from "next/script";

// Cloudflare Turnstile widget. Renders only when NEXT_PUBLIC_TURNSTILE_SITE_KEY
// is set, so until you add the key the auth forms look and behave exactly as
// before (and the server verifier skips too — see lib/turnstile.ts). CF's
// api.js auto-renders any .cf-turnstile element and injects a hidden
// <input name="cf-turnstile-response"> into the enclosing <form>, which the
// server action reads.
export function Turnstile() {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  if (!siteKey) return null;
  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
      <div className="cf-turnstile" data-sitekey={siteKey} />
    </>
  );
}
