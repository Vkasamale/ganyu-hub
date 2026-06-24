import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CreativeCard } from "@/components/creative-card";
import { JobCard } from "@/components/job-card";

export default async function SavedPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: rows } = await supabase
    .from("saved_items")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const creativeIds = (rows || []).filter((r: any) => r.target_type === "creative").map((r: any) => r.target_id);
  const jobIds = (rows || []).filter((r: any) => r.target_type === "job").map((r: any) => r.target_id);

  const { data: creatives } = creativeIds.length
    ? await supabase.from("profiles").select("*").in("id", creativeIds)
    : { data: [] as any[] };
  const { data: jobs } = jobIds.length
    ? await supabase.from("jobs").select("*").in("id", jobIds)
    : { data: [] as any[] };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 space-y-10">
      <h1 className="text-3xl font-bold">Saved</h1>

      <section>
        <h2 className="text-xl font-semibold">Saved creatives ({creatives?.length || 0})</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(creatives || []).map((p: any) => <CreativeCard key={p.id} profile={p} saved showSave />)}
          {(creatives?.length || 0) === 0 && <p className="text-neutral-500">No saved creatives yet.</p>}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Saved jobs ({jobs?.length || 0})</h2>
        <div className="mt-4 grid gap-4">
          {(jobs || []).map((j: any) => <JobCard key={j.id} job={j} saved showSave />)}
          {(jobs?.length || 0) === 0 && <p className="text-neutral-500">No saved jobs yet.</p>}
        </div>
      </section>
    </div>
  );
}
