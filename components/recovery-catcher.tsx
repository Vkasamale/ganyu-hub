"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function RecoveryCatcher() {
  const router = useRouter();
  useEffect(() => {
    if (!window.location.hash) return;
    const params = new URLSearchParams(window.location.hash.slice(1));
    if (params.get("type") !== "recovery") return;
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");
    if (!access_token || !refresh_token) return;
    const supabase = createClient();
    supabase.auth.setSession({ access_token, refresh_token }).then(() => {
      history.replaceState(null, "", "/");
      router.replace("/reset-password");
    });
  }, [router]);
  return null;
}
