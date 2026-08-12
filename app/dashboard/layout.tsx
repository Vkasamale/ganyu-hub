import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/supabase/user";
import { DashboardNav } from "@/components/dashboard-nav";
import { ProductTour } from "@/components/product-tour";
import { formatMwk } from "@/lib/utils";

type Role = "client" | "creative" | "agency";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  // BUG-020: request-deduped, so layout + page + navbar cost one Auth call.
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("role, onboarded_at, is_admin, toured_at").eq("id", user.id).single();
  // No profile row yet, or an OAuth user who hasn't picked a role → send them to
  // pick one. A missing row must NOT fall through to a default-creative dashboard.
  if (!profile || !profile.role) redirect("/onboarding/role");
  if (!profile.onboarded_at) {
    redirect(profile.role === "client" ? "/onboarding/client" : "/onboarding/creative");
  }
  const role: Role = (profile?.role as Role) || "creative";
  const isClient = role === "client";

  const reminders: { priority: "high" | "medium" | "low"; title: string; subtitle: string; href: string }[] = [];
  if (isClient) {
    const { data: jobs } = await supabase
      .from("jobs")
      .select("id, title, status")
      .eq("client_id", user.id)
      .in("status", ["scope_pending", "submitted"]);
    (jobs || []).forEach((j) => {
      if (j.status === "scope_pending") {
        reminders.push({ priority: "high", title: `Confirm scope on "${j.title}"`, subtitle: "Awaiting your sign-off", href: `/jobs/${j.id}` });
      } else if (j.status === "submitted") {
        reminders.push({ priority: "high", title: `Review submitted work — "${j.title}"`, subtitle: "Accept or request a revision", href: `/jobs/${j.id}` });
      }
    });
    const { data: myJobIds } = await supabase.from("jobs").select("id").eq("client_id", user.id);
    const ids = (myJobIds || []).map((r) => r.id);
    if (ids.length) {
      const { data: pending } = await supabase
        .from("proposals")
        .select("id, job_id, bid_mwk, profiles:profiles!proposals_creative_id_fkey(full_name)")
        .in("job_id", ids)
        .eq("status", "pending")
        .limit(4);
      (pending || []).forEach((p: any) =>
        reminders.push({
          priority: "medium",
          title: `New proposal from ${p.profiles?.full_name || "a creative"}`,
          subtitle: `Bid: ${formatMwk(p.bid_mwk)}`,
          href: `/jobs/${p.job_id}`,
        })
      );
    }
  } else {
    const { data: accepted } = await supabase
      .from("proposals")
      .select("id, jobs:jobs!proposals_job_id_fkey(id, title, status, creative_confirmed_scope_at)")
      .eq("creative_id", user.id)
      .eq("status", "accepted");
    (accepted || []).forEach((p: any) => {
      const j = p.jobs;
      if (!j) return;
      if (j.status === "scope_pending" && !j.creative_confirmed_scope_at) {
        reminders.push({ priority: "high", title: `Confirm scope on "${j.title}"`, subtitle: "The client is waiting", href: `/jobs/${j.id}` });
      } else if (j.status === "in_progress") {
        reminders.push({ priority: "medium", title: `Submit work — "${j.title}"`, subtitle: "In progress", href: `/jobs/${j.id}` });
      } else if (j.status === "revision_requested") {
        reminders.push({ priority: "high", title: `Revision requested — "${j.title}"`, subtitle: "Re-submit when ready", href: `/jobs/${j.id}` });
      }
    });
  }

  // First-run guidance: when nothing is pending, point new users at the core
  // action for their role instead of a dead-end "all caught up".
  if (reminders.length === 0) {
    if (isClient) {
      reminders.push({ priority: "high", title: "Post your first job", subtitle: "Describe what you need — creatives come to you", href: "/jobs/new" });
      reminders.push({ priority: "low", title: "Browse creatives", subtitle: "See who's available to hire", href: "/browse" });
    } else {
      reminders.push({ priority: "high", title: "Find work to bid on", subtitle: "Browse open jobs and send a proposal", href: "/jobs" });
      reminders.push({ priority: "low", title: "Polish your public profile", subtitle: "Add work so clients pick you", href: `/creatives/${user.id}` });
    }
  }

  const navItems = [
    { href: "/dashboard", label: "Home" },
    { href: "/dashboard/jobs", label: "Jobs" },
    { href: "/dashboard/proposals", label: "Proposals" },
    { href: "/messages", label: "Messages" },
    ...(!isClient
      ? [
          { href: "/dashboard/portfolio", label: "Portfolio" },
          { href: "/dashboard/services", label: "Rate card" },
          { href: "/dashboard/testimonials", label: "Testimonials" },
        ]
      : []),
    { href: "/dashboard/payments", label: "Payments" },
    { href: "/dashboard/saved", label: "Saved" },
    { href: "/dashboard/profile", label: "Edit profile" },
    { href: "/dashboard/account", label: "Account & security" },
    { href: `/creatives/${user.id}`, label: "View public profile" },
    ...(profile?.is_admin ? [{ href: "/admin", label: "Admin" }] : []),
  ];

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 md:grid-cols-[180px_minmax(0,1fr)_280px] md:gap-10 md:py-10">
      <ProductTour role={role} seen={!!profile?.toured_at} />
      <aside data-tour="nav" className="md:sticky md:top-20 md:self-start md:max-h-[calc(100vh-5rem)] md:overflow-y-auto">
        <p className="eyebrow hidden md:block">Workspace</p>
        <DashboardNav items={navItems} />
      </aside>

      <main data-tour="main" className="min-w-0">{children}</main>

      <aside data-tour="reminders" className="md:sticky md:top-20 md:self-start md:max-h-[calc(100vh-5rem)] md:overflow-y-auto">
        <div className="flex items-center justify-between">
          <p className="eyebrow">Reminders</p>
          {reminders.length > 0 && (
            <span
              className="font-display text-xs italic text-stamp-dark"
              style={{ fontStyle: "italic", fontVariationSettings: '"opsz" 144, "SOFT" 100, "WONK" 1' }}
            >
              {reminders.length}
            </span>
          )}
        </div>
        <div className="mt-3 space-y-2">
          {reminders.length === 0 && (
            <p className="rounded-lg border border-dashed border-ink/20 bg-paper p-4 text-xs text-ink/55">
              You're all caught up.
            </p>
          )}
          {reminders.slice(0, 6).map((r, i) => (
            <Link key={i} href={r.href} className="card-soft block p-4 transition hover:-translate-y-0.5">
              <span
                className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                  r.priority === "high"
                    ? "bg-stamp/10 text-stamp-dark"
                    : r.priority === "medium"
                    ? "bg-mark/10 text-mark"
                    : "bg-ink/10 text-ink/70"
                }`}
              >
                {r.priority}
              </span>
              <p className="mt-2 text-sm font-medium text-ink">{r.title}</p>
              <p className="mt-0.5 text-xs text-ink/60">{r.subtitle}</p>
            </Link>
          ))}
        </div>
      </aside>
    </div>
  );
}
