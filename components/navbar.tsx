import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/supabase/user";
import { Button } from "@/components/ui/button";
import { NotificationBell, type NotificationItem } from "@/components/notification-bell";
import { NavbarBrowseLinks } from "@/components/navbar-browse-links";
import { UserMenu } from "@/components/user-menu";
import { Logo } from "@/components/logo";
import { PrimaryNav } from "@/components/primary-nav";
import { BottomTabBar } from "@/components/bottom-tab-bar";
import { NavIcon } from "@/components/nav-icons";
import type { NavRole } from "@/lib/nav";

export async function Navbar() {
  const supabase = createClient();
  // BUG-020: one deduped Auth call per request render.
  const user = await getSessionUser();

  let notifications: NotificationItem[] = [];
  let profile: { full_name: string | null; is_admin: boolean | null; role: string | null } | null = null;
  let unread = 0;
  if (user) {
    const [{ data: nots }, { data: p }, { count }] = await Promise.all([
      supabase
        .from("notifications")
        .select("id, kind, title, body, link, read_at, created_at, target_type")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20),
      supabase.from("profiles").select("full_name, is_admin, role").eq("id", user.id).single(),
      // Phase 7: the Messages tab carries its own count, so an unread reply is
      // visible from anywhere rather than only from the bell (§H3).
      supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("target_type", "thread")
        .is("read_at", null),
    ]);
    notifications = (nots || []) as NotificationItem[];
    profile = p;
    unread = count || 0;
  }

  return (
    <>
    <header className="sticky top-0 z-40 border-b border-black/[0.08] bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 md:px-8">
        <Logo />
        {/* Item 60 (§K3): verbs for signed-in users — "Find work" says what you
            get where "Dashboard" says what we call it. Signed-out visitors keep
            the two browse links, which is the right ask before an account. */}
        {user ? <PrimaryNav role={(profile?.role as NavRole) ?? null} /> : <NavbarBrowseLinks />}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <NotificationBell userId={user.id} initialItems={notifications} />
              <Link href="/jobs/new" className="hidden sm:block"><Button size="sm">Post a job</Button></Link>
              {/* Item 58: settings has its own target instead of living three
                  rows into a dropdown. */}
              <Link
                href="/dashboard/account"
                aria-label="Settings"
                className="hidden rounded-full p-2 text-ink/50 transition-colors hover:bg-ink/5 hover:text-ink md:block"
              >
                <NavIcon name="settings" className="h-[18px] w-[18px]" />
              </Link>
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

    {/* Rendered as a SIBLING of the header, never inside it. The header sets
        `backdrop-blur`, and a backdrop-filter ancestor becomes the containing
        block for `position: fixed` — nested here, the bar anchored to the
        header and sat 113px down the page instead of at the bottom of the
        screen. Kept in this component (rather than the layout) so it reuses
        the role and unread count already fetched above. */}
    {user && (
      <BottomTabBar
        role={(profile?.role as NavRole) ?? null}
        userId={user.id}
        isAdmin={!!profile?.is_admin}
        unreadCount={unread}
      />
    )}
    </>
  );
}
