import Image from "next/image";

export function HeroArt() {
  return (
    <div className="relative h-full w-full">
      {/* clay arc backdrop — top half */}
      <svg
        viewBox="0 0 480 560"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 h-full w-full"
        aria-hidden
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern id="rosette" x="0" y="0" width="44" height="44" patternUnits="userSpaceOnUse">
            <rect width="44" height="44" fill="#DACFB2" />
            <circle cx="22" cy="22" r="7" fill="none" stroke="#1A1611" strokeWidth="1.1" />
            <circle cx="22" cy="22" r="3" fill="#B6332A" />
            <path d="M22 10 L25 19 L34 22 L25 25 L22 34 L19 25 L10 22 L19 19 Z" fill="#1A1611" opacity="0.82" />
          </pattern>
          <pattern id="stripes" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="12" height="12" fill="#2F5D3B" />
            <rect width="2.5" height="12" fill="#1A1611" opacity="0.28" />
          </pattern>
        </defs>

        {/* warm clay arc */}
        <path
          d="M 60 60 Q 60 -30 240 -30 Q 420 -30 420 60 L 420 300 L 60 300 Z"
          fill="#B6332A"
          opacity="0.95"
        />
        {/* chitenje block — peeks out behind photo, right side */}
        <rect x="320" y="220" width="140" height="260" fill="url(#rosette)" stroke="#1A1611" strokeWidth="1.2" />
        {/* stripe block — bottom-right behind */}
        <rect x="350" y="430" width="110" height="120" fill="url(#stripes)" stroke="#1A1611" strokeWidth="1.2" />
      </svg>

      {/* hero photo — anchored bottom-left, overlaps the arc + chitenje */}
      <div className="absolute bottom-6 left-2 right-20 top-10 overflow-hidden rounded-lg ring-1 ring-ink/15 shadow-[0_4px_0_rgba(26,22,17,0.15)] md:bottom-10 md:left-4 md:right-24 md:top-16">
        <Image
          src="/hero-photographer.webp"
          alt="A Malawian photographer at work"
          fill
          sizes="(max-width: 768px) 100vw, 45vw"
          className="object-cover"
          priority
        />
      </div>

      {/* press-mark watermark — italic Fraunces k in top corner */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-2 top-2 select-none font-display text-7xl italic leading-none text-paper md:top-4 md:text-8xl"
        style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100, "WONK" 1' }}
      >
        k
      </span>

      {/* circular badge — adapted from inspo's "Explore all property" */}
      <a
        href="/browse"
        className="group absolute -bottom-4 right-6 z-10 flex h-28 w-28 items-center justify-center rounded-full bg-paper text-ink shadow-[0_2px_0_rgba(26,22,17,0.18)] ring-1 ring-ink/20 transition-transform hover:scale-105 md:bottom-0 md:right-2"
      >
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full animate-[spin_18s_linear_infinite]" aria-hidden>
          <defs>
            <path id="badge-arc" d="M 50,50 m -36,0 a 36,36 0 1,1 72,0 a 36,36 0 1,1 -72,0" />
          </defs>
          <text fontFamily="var(--font-plex-mono), monospace" fontSize="9" letterSpacing="3" fill="#1A1611">
            <textPath href="#badge-arc" startOffset="0">FIND CREATIVES · FIND CREATIVES · </textPath>
          </text>
        </svg>
        <span className="font-display text-3xl italic text-stamp" style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100, "WONK" 1' }}>
          →
        </span>
      </a>
    </div>
  );
}
