import "./globals.css";
import type { Metadata } from "next";
import Script from "next/script";
import { Inter, IBM_Plex_Mono, Instrument_Serif } from "next/font/google";
import { Toaster } from "sonner";
import { Navbar } from "@/components/navbar";
import { RecoveryCatcher } from "@/components/recovery-catcher";
import { RELEASES, VERSION } from "@/lib/whats-new";

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
        {!bareLayout && <Navbar />}
        <main>{children}</main>
        {!bareLayout && <footer className="mt-16 border-t border-ink/10 px-4 py-6 text-sm text-ink/60">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2">
            <span className="flex items-center gap-1.5">
              © Ganyu Hub
              <details className="group relative">
                <summary className="cursor-pointer list-none rounded-full border border-ink/10 px-2 py-0.5 text-xs text-ink/60 hover:text-ink [&::-webkit-details-marker]:hidden">
                  v{VERSION}
                </summary>
                <div className="absolute bottom-full left-0 z-20 mb-2 w-72 rounded-lg border border-ink/10 bg-white p-4 text-left shadow-lg">
                  <div className="mb-2 text-sm font-semibold text-ink">What's new</div>
                  <div className="max-h-72 space-y-3 overflow-y-auto">
                    {RELEASES.map((r) => (
                      <div key={r.version}>
                        <div className="text-xs font-medium text-ink/80">v{r.version} · {r.date}</div>
                        <ul className="mt-1 list-disc space-y-1 pl-4 text-xs text-ink/60">
                          {r.notes.map((n, i) => <li key={i}>{n}</li>)}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </details>
            </span>
            <div className="flex flex-wrap gap-4">
              <a href="/contact" className="underline hover:text-ink">Contact</a>
              <a href="/terms" className="underline hover:text-ink">Terms</a>
              <a href="/privacy" className="underline hover:text-ink">Privacy</a>
              <a href="/content-policy" className="underline hover:text-ink">Content policy</a>
              <a href="/dashboard/report" className="underline hover:text-ink">Report an issue</a>
            </div>
          </div>
        </footer>}
        <Toaster position="bottom-right" richColors closeButton />
      </body>
    </html>
  );
}
