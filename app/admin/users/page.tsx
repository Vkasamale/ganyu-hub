import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/supabase/user";
import { formatSAST } from "@/lib/admin-format";
import { VerifiedBadge } from "@/components/verified-badge";
import { setVerified } from "@/app/actions";
import { SavingForm } from "@/components/saving-form";

const ROLES = [
  { key: "all", label: "All" },
  { key: "client", label: "Clients" },
  { key: "creative", label: "Creatives" },
  { key: "agency", label: "Agencies" },
  { key: "admin", label: "Admins" },
] as const;

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ role?: string; q?: string }> }) {
  const supabase = createClient();
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const { data: me } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  if (!me?.is_admin) redirect("/dashboard");

  const sp = await searchParams;
  const role = (ROLES.find((r) => r.key === sp?.role)?.key) || "all";
  const q = (sp?.q || "").trim();

  let query = supabase.from("profiles")
    .select("id, full_name, role, is_admin, created_at, verified_at")
    .order("created_at", { ascending: false })
    .limit(100);
  if (role === "admin") query = query.eq("is_admin", true);
  else if (role !== "all") query = query.eq("role", role);
  if (q) query = query.ilike("full_name", `%${q.replace(/[%_]/g, "")}%`);

  const { data: users } = await query;

  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl font-semibold text-ink">Users</h1>

      <form className="flex flex-wrap items-center gap-2" action="/admin/users">
        <input type="hidden" name="role" value={role} />
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by name…"
          className="min-w-0 flex-1 rounded-md border border-ink/15 bg-white px-3 py-1.5 text-sm"
        />
        <button className="rounded-md bg-ink px-3 py-1.5 text-sm font-medium text-paper hover:bg-stamp">Search</button>
      </form>

      <div className="flex flex-wrap gap-2">
        {ROLES.map((r) => {
          const active = role === r.key;
          const href = r.key === "all"
            ? `/admin/users${q ? `?q=${encodeURIComponent(q)}` : ""}`
            : `/admin/users?role=${r.key}${q ? `&q=${encodeURIComponent(q)}` : ""}`;
          return (
            <Link
              key={r.key}
              href={href}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${active ? "border-ink bg-ink text-paper" : "border-ink/15 bg-white text-ink/70 hover:bg-ink/5"}`}
            >
              {r.label}
            </Link>
          );
        })}
      </div>

      <p className="text-xs text-ink/55">{users?.length || 0} shown</p>

      <div className="divide-y divide-ink/10 rounded-lg border border-ink/10 bg-white">
        {(!users || users.length === 0) && (
          <p className="p-6 text-center text-sm text-ink/55">No users match.</p>
        )}
        {(users || []).map((p: any) => (
          <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <Link href={p.role === "client" ? "#" : `/creatives/${p.id}`} className="text-sm font-medium text-ink hover:underline break-words">
                {p.full_name || "Unnamed"}
              </Link>
              <p className="text-xs text-ink/55">{p.role} · joined {formatSAST(p.created_at)}</p>
            </div>
            <div className="flex items-center gap-2">
              {p.is_admin && (
                <span className="rounded-full bg-stamp/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-stamp-dark">admin</span>
              )}
              <VerifiedBadge verifiedAt={p.verified_at} />
              {/* Item 77: clients are not vetted — the badge answers "can I
                  trust this creative with my money", which nobody asks about
                  the person paying. SavingForm rather than a bare <form>: this
                  action is admin-gated and service-role, so it can fail, and a
                  silent failure on a trust badge is the worst kind. */}
              {p.role !== "client" && (
                <SavingForm
                  action={setVerified}
                  successText={p.verified_at ? "Withdrawn." : "Marked as checked."}
                  silent
                >
                  <input type="hidden" name="profile_id" value={p.id} />
                  <input type="hidden" name="grant" value={p.verified_at ? "0" : "1"} />
                  <button
                    type="submit"
                    className={
                      "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors " +
                      (p.verified_at
                        ? "border-ink/15 text-ink/60 hover:border-ink/30"
                        : "border-mark/40 text-mark hover:bg-mark/[0.06]")
                    }
                  >
                    {p.verified_at ? "Withdraw" : "Mark checked"}
                  </button>
                </SavingForm>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
