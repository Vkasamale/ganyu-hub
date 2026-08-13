import "./globals.css";
import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Inter, IBM_Plex_Mono, Instrument_Serif } from "next/font/google";
import { Toaster } from "sonner";
import { Navbar } from "@/components/navbar";
import { RecoveryCatcher } from "@/components/recovery-catcher";
import { ServiceWorkerRegistrar } from "@/components/pwa";
import { Footer } from "@/components/footer";
import { InstallBanner } from "@/components/install-banner";
import { AnnouncementBar } from "@/components/announcement-bar";

const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

const siteUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://ganyu-hub.vercel.app";

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
  return (
    <html lang="en" className={`${inter.variable} ${plexMono.variable} ${instrumentSerif.variable}`}>
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
        {!bareLayout && <AnnouncementBar />}
        {!bareLayout && <InstallBanner />}
        {!bareLayout && <Navbar />}
        <main>{children}</main>
        {!bareLayout && <Footer />}
        {/* Phase 7 item 56: the tab bar is fixed, so the last thing on every
            page would sit underneath it. Height of the bar plus the iOS home
            indicator; collapses to zero from `md` up, where no bar renders. */}
        {!bareLayout && (
          <div aria-hidden className="h-[calc(3.5rem+env(safe-area-inset-bottom))] md:hidden" />
        )}
        <Toaster position="bottom-right" richColors closeButton />
      </body>
    </html>
  );
}
