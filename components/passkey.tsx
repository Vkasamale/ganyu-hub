"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

// WebAuthn is browser-only: navigator.credentials cannot run in a server action,
// so unlike every other auth path here (which is a server-action form) these two
// buttons are client components.
//
// ponytail: native PublicKeyCredential check rather than pulling in a helper —
// if the constructor is missing the browser cannot do passkeys, full stop.
// Checked in an effect so the server and first client render agree.
function useWebAuthnSupported() {
  const [supported, setSupported] = useState(false);
  useEffect(() => {
    setSupported(typeof window !== "undefined" && !!window.PublicKeyCredential);
  }, []);
  return supported;
}

// A cancelled or timed-out prompt is a user closing a dialog, not a failure
// worth a red banner. Everything else gets shown.
function isCancellation(err: { name?: string; message?: string }) {
  const text = `${err?.name || ""} ${err?.message || ""}`.toLowerCase();
  return text.includes("notallowed") || text.includes("abort") || text.includes("cancel") || text.includes("timed out");
}

function KeyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="7.5" cy="15.5" r="4.5" />
      <path d="m10.7 12.3 8.8-8.8" />
      <path d="m17 6 2.5 2.5" />
      <path d="m20 3 1.5 1.5" />
    </svg>
  );
}

export function PasskeySignIn() {
  const supported = useWebAuthnSupported();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Nothing renders on a browser that cannot do this, rather than a button
  // that fails on tap. §Q7 — no dead control where there is no capability.
  if (!supported) return null;

  async function signIn() {
    setBusy(true);
    setError(null);
    const { error } = await createClient().auth.signInWithPasskey();
    if (error) {
      if (!isCancellation(error)) {
        setError("That passkey did not work. Use your email and password below.");
      }
      setBusy(false);
      return;
    }
    // createBrowserClient writes the session to cookies, so the server sees it
    // on the next request. refresh() re-runs the server components with it.
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="space-y-2">
      <Button type="button" variant="outline" className="w-full gap-2" onClick={signIn} disabled={busy}>
        <KeyIcon />
        {busy ? "Waiting for your device…" : "Continue with a passkey"}
      </Button>
      {error && <p className="text-sm text-red-700">{error}</p>}
    </div>
  );
}

export function RegisterPasskey() {
  const supported = useWebAuthnSupported();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!supported) {
    return <p className="text-sm text-neutral-500">This browser cannot store passkeys. You can still sign in with your email and password.</p>;
  }

  async function register() {
    setBusy(true);
    setError(null);
    const { error } = await createClient().auth.registerPasskey();
    if (error) {
      if (!isCancellation(error)) {
        setError("Could not add that passkey. Please try again.");
      }
      setBusy(false);
      return;
    }
    setDone(true);
    setBusy(false);
  }

  return (
    <div className="space-y-2">
      <Button type="button" variant="outline" className="gap-2" onClick={register} disabled={busy || done}>
        <KeyIcon />
        {done ? "Passkey added" : busy ? "Waiting for your device…" : "Add a passkey"}
      </Button>
      {done && <p className="text-sm text-emerald-800">Next time you can sign in with your fingerprint, face or screen lock.</p>}
      {error && <p className="text-sm text-red-700">{error}</p>}
    </div>
  );
}
