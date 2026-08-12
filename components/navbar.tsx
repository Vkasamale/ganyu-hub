import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/supabase/user";
import { Button } from "@/components/ui/button";
import { NotificationBell, type NotificationItem } from "@/components/notification-bell";
import { NavbarBrowseLinks } from "@/components/navbar-browse-links";
import { UserMenu } from "@/components/user-menu";
import { Logo } from "@/components/logo";

export async function Navbar() {
  const supabase = createClient();
  // BUG-020: one deduped Auth call per request render.
  const user = await getSessionUser();

  let notifications: NotificationItem[] = [];
  let profile: { full_name: string | null; is_admin: boolean | null } | null = null;
  if (user) {
    const [{ data: nots }, { data: p }] = await Promise.all([
      supabase
        .from("notifications")
        .select("id, kind, title, body, link, read_at, created_at, target_type")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20),
      supabase.from("profiles").select("full_name, is_admin").eq("id", user.id).single(),
    ]);
    notifications = (nots || []) as NotificationItem[];
    profile = p;
  }

  return (
    <header className="sticky top-0 z-40 border-b border-black/[0.08] bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 md:px-8">
        <Logo />
        <NavbarBrowseLinks />
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <NotificationBell userId={user.id} initialItems={notifications} />
              <Link href="/jobs/new"><Button size="sm">Post a job</Button></Link>
              <UserMenu name={profile?.full_name || null} email={user.email || null} userId={user.id} isAdmin={!!profile?.is_admin} />
            </>
          ) : (
            <>
              <Link href="/login"><Button variant="ghost" size="sm">Log in</Button></Link>
              <Link href="/signup"><Button size="sm">Sign up</Button></Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
