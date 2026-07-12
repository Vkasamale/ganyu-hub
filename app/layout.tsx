import "./globals.css";
import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono, Instrument_Serif } from "next/font/google";
import { Toaster } from "sonner";
import { Navbar } from "@/components/navbar";
import { RecoveryCatcher } from "@/components/recovery-catcher";

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

export const metadata: Metadata = {
  title: "Ganyu Hub — hire Malawian creatives",
  description: "The marketplace for hiring Malawian designers, developers, and creatives.",
  icons: { icon: "/logo-g.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${plexMono.variable} ${instrumentSerif.variable}`}>
      <body className="min-h-screen bg-white font-sans text-ink">
        <RecoveryCatcher />
        <Navbar />
        <main>{children}</main>
        <footer className="mt-16 border-t border-ink/10 px-4 py-6 text-sm text-ink/60">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2">
            <span>© Ganyu Hub</span>
            <div className="flex gap-4">
              <a href="/content-policy" className="underline hover:text-ink">Content policy</a>
              <a href="/dashboard/report" className="underline hover:text-ink">Report an issue</a>
            </div>
          </div>
        </footer>
        <Toaster position="bottom-right" richColors closeButton />
      </body>
    </html>
  );
}
