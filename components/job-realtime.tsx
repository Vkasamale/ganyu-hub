"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function JobRealtime({ jobId }: { jobId: string }) {
  const router = useRouter();
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`job:${jobId}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "jobs", filter: `id=eq.${jobId}` }, () => router.refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "proposals", filter: `job_id=eq.${jobId}` }, () => router.refresh())
      .subscribe();
    const interval = setInterval(() => router.refresh(), 10000);
    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [jobId, router]);
  return null;
}
