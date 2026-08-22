import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/supabase/user";
import { DashboardNav } from "@/components/dashboard-nav";
import { DashboardRail } from "@/components/dashboard-rail";
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
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 md:grid-cols-[180px_minmax(0,1fr)_340px] md:gap-10 md:py-10">
      <ProductTour role={role} seen={!!profile?.toured_at} />
      <aside data-tour="nav" className="md:sticky md:top-20 md:self-start md:max-h-[calc(100vh-5rem)] md:overflow-y-auto">
        <p className="eyebrow hidden md:block">Workspace</p>
        <DashboardNav items={navItems} />
      </aside>

      <main data-tour="main" className="min-w-0">{children}</main>

      <aside data-tour="rail" className="md:sticky md:top-20 md:self-start md:max-h-[calc(100vh-5rem)] md:overflow-y-auto">
        <DashboardRail userId={user.id} />
      </aside>
    </div>
  );
}
