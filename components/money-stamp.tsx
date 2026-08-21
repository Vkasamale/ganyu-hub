import Image from "next/image";

/**
 * The five stages a job's money passes through, each a pressed rubber stamp.
 * The most distinctive device in the product, and the one element that should
 * be memorable — everything else gets out of the way.
 *
 * The stamps are supplied artwork in `public/stamps/`, not drawn in code. A
 * coded imitation was tried and replaced: the wear, the uneven ink and the
 * arced lettering are the point, and a border with a ring reads as a rounded
 * chip however it is tuned. Do not substitute a chip, a badge, or a dashed
 * outline.
 *
 * Never render all five in grey. Grey reads as "nothing changed", and these are
 * the five most consequential facts in the product.
 *
 * `nothing-yet` is a sixth stamp and belongs to empty states, not here — the
 * five money stamps are never borrowed for absence, because they name stages of
 * money and nothing has moved yet.
 */
export const MONEY_STATES = {
  none: { label: "No payment yet", slug: "no-payment-yet", ink: "#8C8C8C" },
  payment_pending: { label: "Payment pending", slug: "payment-pending", ink: "#E9A23B" },
  payment_held: { label: "In escrow", slug: "in-escrow", ink: "#1D6E9E" },
  payment_released: { label: "Released", slug: "released", ink: "#1B9455" },
  payment_disputed: { label: "In dispute", slug: "in-dispute", ink: "#C22A2A" },
} as const;

export type MoneyState = keyof typeof MONEY_STATES;

export function moneyState(escrowStatus?: string | null) {
  return MONEY_STATES[(escrowStatus || "none") as MoneyState] ?? MONEY_STATES.none;
}

// 80 in dense rows, 104 on mobile, 148 from md up.
const SIZES = { sm: 80, md: 104, lg: 148 } as const;

export function MoneyStamp({
  state,
  size = "md",
  className = "",
}: {
  state?: string | null;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const s = moneyState(state);
  const px = SIZES[size];
  return (
    <Image
      src={`/stamps/${s.slug}.png`}
      alt={s.label}
      title={s.label}
      width={px}
      height={px}
      // The stamp is the page's signature, not decoration below the fold — on a
      // job header it is visible immediately, so lazy-loading it just means the
      // money state arrives late.
      priority={size === "lg"}
      className={`block shrink-0 select-none ${className}`}
      style={{ width: px, height: px }}
    />
  );
}
