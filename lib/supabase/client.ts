"use client";
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    // signInWithPasskey / registerPasskey throw without this opt-in. Passkeys
    // are beta in Supabase; the flag is how they mark an API that may change.
    { auth: { experimental: { passkey: true } } }
  );
}
