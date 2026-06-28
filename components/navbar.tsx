import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { NotificationBell, type NotificationItem } from "@/components/notification-bell";
import { UserMenu } from "@/components/user-menu";

export async function Navbar() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let notifications: NotificationItem[] = [];
  let profile: { full_name: string | null; is_admin: boolean | null } | null = null;
  if (user) {
    const [{ data: nots }, { data: p }] = await Promise.all([
      supabase
        .from("notifications")
        .select("id, kind, title, body, link, read_at, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20),
      supabase.from("profiles").select("full_name, is_admin").eq("id", user.id).single(),
    ]);
    notifications = (nots || []) as NotificationItem[];
    profile = p;
  }

  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <Link href="/" className="flex shrink-0 items-center gap-2 text-lg font-bold">
          <span className="text-brand">Ganyu</span>
          <span className="text-brand-ink">Hub</span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm text-neutral-600 sm:flex">
          <Link href="/browse" className="hover:text-brand-ink">Browse creatives</Link>
          <Link href="/jobs" className="hover:text-brand-ink">Browse jobs</Link>
        </nav>
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
