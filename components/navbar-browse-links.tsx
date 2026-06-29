"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavbarBrowseLinks() {
  const pathname = usePathname();
  if (pathname === "/") return null;
  return (
    <nav className="hidden items-center gap-5 text-sm text-ink/70 sm:flex">
      <Link href="/browse" className="hover:text-ink">Find creatives</Link>
      <Link href="/jobs" className="hover:text-ink">Find jobs</Link>
    </nav>
  );
}
