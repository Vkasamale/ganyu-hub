import "./globals.css";
import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { Navbar } from "@/components/navbar";
import { RecoveryCatcher } from "@/components/recovery-catcher";
import { ServiceWorkerRegistrar } from "@/components/pwa";
import { Footer } from "@/components/footer";
import { PreFooter } from "@/components/pre-footer";
import { InstallBanner } from "@/components/install-banner";
import { AnnouncementBar } from "@/components/announcement-bar";
import { SITE_URL } from "@/lib/site-url";

const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
// Inter is the only face (settled 2026-08-14). IBM Plex Mono and Instrument
// Serif were dropped: figures align via font-variant-numeric, not a second
// typeface, and one font file is one download on a paid mobile connection.

// Was a second, drifted copy of this resolution that still fell back to the
// vercel.app host — so with APP_URL unset, every OG/canonical URL Next resolves
// against metadataBase pointed at the old domain while share links (absUrl)
// pointed at ganyuhub.com. One source now; preview deploys keep resolving to
// themselves, which is the behaviour lib/site-url.ts exists for.
const siteUrl = SITE_URL;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Ganyu Hub — hire Malawian creatives",
  description: "The marketplace for hiring Malawian designers, developers, and creatives.",
  // No `apple` entry here on purpose: app/apple-icon.png is a Next file
  // convention and Next injects the <link rel="apple-touch-icon"> itself with
  // the right hashed URL. Declaring it manually would point at a 404.
  icons: { icon: "/logo-g.png" },
  appleWebApp: {
    // iOS ignores the manifest's display mode; these are what give the
    // home-screen app its full-screen chrome and title.
    capable: true,
    title: "Ganyu Hub",
    statusBarStyle: "default",
  },
  openGraph: {
    // images intentionally omitted — app/opengraph-image.tsx supplies the
    // branded 1200x630 card that Next injects automatically.
    title: "Ganyu Hub — hire Malawian creatives",
    description: "The marketplace for hiring Malawian designers, developers, and creatives.",
    url: siteUrl,
    siteName: "Ganyu Hub",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ganyu Hub — hire Malawian creatives",
    description: "The marketplace for hiring Malawian designers, developers, and creatives.",
  },
};

// Separate from `metadata` because Next moved themeColor here — leaving it in
// metadata builds fine but logs a deprecation and emits nothing.
export const viewport: Viewport = {
  themeColor: "#069494",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // ponytail: strip nav/footer chrome on public share-link landing (/j/[token])
  // so the client sees only the job + signup — no browse/homepage escape hatch.
  // x-pathname is set by root middleware.ts.
  const { headers } = await import("next/headers");
  const pathname = (await headers()).get("x-pathname") || "";
  const bareLayout = pathname.startsWith("/j/");
  // Messaging is a full screen on a phone, not a panel inside the site chrome —
  // the list as well as the thread. Screen 07 draws both with their own header
  // (a back arrow, the other person, the compose button) and no site nav, tab
  // bar or footer at all, which is how every messaging app on the device
  // behaves. Desktop keeps the shell, because there the rail and the list are
  // the point.
  const messagesView = pathname === "/messages" || /^\/messages\/[^/]+$/.test(pathname);
  const chromeClass = messagesView ? "hidden md:block" : undefined;
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-white font-sans text-ink">
        {plausibleDomain && (
          <Script defer data-domain={plausibleDomain} src="https://plausible.io/js/script.js" />
        )}
        <RecoveryCatcher />
        <ServiceWorkerRegistrar />
        {/* Both sit above the nav, which is sticky — audit §Q8. Announcement
            on top: it is founder-set and time-limited, so it outranks a
            standing install prompt. They only ever stack when ANNOUNCEMENT is
            non-null, which is a deliberate choice made in one place. */}
        {!bareLayout && (
          <div className={chromeClass}>
            <AnnouncementBar />
            <InstallBanner />
            <Navbar />
          </div>
        )}
        <main>{children}</main>
        {/* Items 62 + 63: a way back in, then the reason to trust us — the two
            things the bottom of a page was missing. */}
        {!bareLayout && (
          <div className={chromeClass}>
            <PreFooter />
            <Footer />
          </div>
        )}
        {/* Phase 7 item 56: the tab bar is fixed, so the last thing on every
            page would sit underneath it. Height of the bar plus the iOS home
            indicator; collapses to zero from `md` up, where no bar renders. */}
        {!bareLayout && !messagesView && (
          <div aria-hidden className="h-[calc(var(--tabbar-height)+var(--safe-bottom))] md:hidden" />
        )}
        <Toaster position="bottom-right" richColors closeButton />
      </body>
    </html>
  );
}
