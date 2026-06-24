import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

export async function Navbar() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold">
          <span className="text-brand">Ganyu</span>
          <span className="text-brand-ink">Hub</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-neutral-600 md:flex">
          <Link href="/browse" className="hover:text-brand-ink">Browse creatives</Link>
          <Link href="/jobs" className="hover:text-brand-ink">Browse jobs</Link>
          {user && <Link href="/dashboard" className="hover:text-brand-ink">Dashboard</Link>}
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link href="/jobs/new"><Button size="sm">Post a job</Button></Link>
              <form action="/auth/signout" method="post">
                <Button variant="ghost" size="sm" type="submit">Sign out</Button>
              </form>
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
