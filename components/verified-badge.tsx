import { BadgeCheck } from "lucide-react";

/**
 * Item 77 (§O2) — the Ganyu-verified badge.
 *
 * §O2 asks for HUMAN vetting, and the wording here is careful because of it.
 * It says "Checked by Ganyu Hub", not "Verified professional" and not
 * "Trusted": we have checked this person's identity and work, which is a claim
 * about our process, not a guarantee about their future conduct. Promising
 * more than we can stand behind is how a trust badge becomes a liability the
 * first time a vetted creative disappears with a deposit.
 *
 * Renders nothing when unverified — there is no "not verified" state. A grey
 * badge on every new creative would turn an absence into an accusation, and
 * everyone starts unverified.
 */
export function VerifiedBadge({
  verifiedAt,
  size = "sm",
}: {
  verifiedAt: string | null | undefined;
  size?: "sm" | "lg";
}) {
  if (!verifiedAt) return null;

  const lg = size === "lg";
  return (
    <span
      title="A person at Ganyu Hub has checked this creative's identity and work."
      className={
        "inline-flex items-center gap-1 rounded-full bg-mark/10 font-medium text-mark " +
        (lg ? "px-2.5 py-1 text-xs" : "px-2 py-0.5 text-[11px]")
      }
    >
      <BadgeCheck className={lg ? "h-4 w-4" : "h-3.5 w-3.5"} aria-hidden />
      Checked by Ganyu Hub
    </span>
  );
}
