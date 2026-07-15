import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardNav } from "@/components/dashboard-nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: me } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!me?.is_admin) notFound();

  const navItems = [
    { href: "/admin", label: "Overview" },
    { href: "/admin#money", label: "Money" },
    { href: "/admin#trends", label: "Trends" },
    { href: "/admin#people", label: "People & activity" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/jobs", label: "Jobs" },
    { href: "/admin/disputes", label: "Disputes" },
    { href: "/admin/cancellations", label: "Cancellations" },
    { href: "/admin/errors", label: "Error log" },
    { href: "/dashboard", label: "← Back to dashboard" },
  ];

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 md:grid-cols-[180px_minmax(0,1fr)] md:gap-10 md:py-10">
      <aside className="md:sticky md:top-20 md:self-start md:max-h-[calc(100vh-5rem)] md:overflow-y-auto">
        <p className="eyebrow">Admin</p>
        <DashboardNav items={navItems} />
      </aside>
      <main className="min-w-0">{children}</main>
    </div>
  );
}
