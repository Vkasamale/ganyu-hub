import Link from "next/link";

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dim = size === "sm" ? 22 : size === "lg" ? 36 : 28;
  const wordSize = size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-xl";
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2">
      <svg width={dim} height={dim} viewBox="0 0 40 40" fill="none" aria-hidden className="shrink-0">
        <rect x="2" y="2" width="36" height="36" rx="6" fill="#B6332A" />
        <path
          d="M14 9 L14 31 M14 22 L22 12 M14 22 L24 31"
          stroke="#EFE6CE"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          transform="skewX(-8)"
        />
        <circle cx="31" cy="11" r="1.6" fill="#EFE6CE" />
      </svg>
      <span className={`font-display ${wordSize} leading-none tracking-tight text-ink`}>
        Ganyu <span className="text-ink/60">Hub</span>
      </span>
    </Link>
  );
}
