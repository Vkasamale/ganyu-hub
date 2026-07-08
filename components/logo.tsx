import Link from "next/link";
import Image from "next/image";

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dim = size === "sm" ? 25 : size === "lg" ? 41 : 32;
  const wordSize = size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-xl";
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2">
      <Image
        src="/logo-g.png"
        alt="Ganyu Hub"
        width={dim}
        height={dim}
        priority
        className="shrink-0 rounded-full"
      />
      <span className={`font-display ${wordSize} leading-none tracking-tight text-ink`}>
        Ganyu <span className="text-ink/60">Hub</span>
      </span>
    </Link>
  );
}
