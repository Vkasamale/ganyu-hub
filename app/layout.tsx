import "./globals.css";
import type { Metadata } from "next";
import Script from "next/script";
import { Inter, IBM_Plex_Mono, Instrument_Serif } from "next/font/google";
import { Toaster } from "sonner";
import { Navbar } from "@/components/navbar";
import { RecoveryCatcher } from "@/components/recovery-catcher";
import { Analytics } from "@vercel/analytics/next";

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
  icons: { icon: "/logo-g.png" },
  openGraph: {
    title: "Ganyu Hub — hire Malawian creatives",
    description: "The marketplace for hiring Malawian designers, developers, and creatives.",
    url: siteUrl,
    siteName: "Ganyu Hub",
    images: [{ url: "/logo-g.png", width: 512, height: 512 }],
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Ganyu Hub — hire Malawian creatives",
    description: "The marketplace for hiring Malawian designers, developers, and creatives.",
    images: ["/logo-g.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${plexMono.variable} ${instrumentSerif.variable}`}>
      <body className="min-h-screen bg-white font-sans text-ink">
        {plausibleDomain && (
          <Script defer data-domain={plausibleDomain} src="https://plausible.io/js/script.js" />
        )}
        <RecoveryCatcher />
        <Navbar />
        <main>{children}</main>
        <footer className="mt-16 border-t border-ink/10 px-4 py-6 text-sm text-ink/60">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2">
            <span>© Ganyu Hub</span>
            <div className="flex flex-wrap gap-4">
              <a href="/contact" className="underline hover:text-ink">Contact</a>
              <a href="/terms" className="underline hover:text-ink">Terms</a>
              <a href="/privacy" className="underline hover:text-ink">Privacy</a>
              <a href="/content-policy" className="underline hover:text-ink">Content policy</a>
              <a href="/dashboard/report" className="underline hover:text-ink">Report an issue</a>
            </div>
          </div>
        </footer>
        <Toaster position="bottom-right" richColors closeButton />
        <Analytics />
      </body>
    </html>
  );
}
