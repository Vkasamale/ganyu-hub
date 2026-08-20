import React from "react";

/**
 * The product's signature device: the five stages a job's money passes through,
 * each as a pressed rubber stamp. Never grey for all five — grey reads as
 * "nothing changed", and these are the five most consequential facts in the
 * product.
 *
 * The stamps are supplied artwork in `assets/stamps/`, not drawn in code. Each
 * carries "Ganyu Hub" arced around a double ring with the state on an angled
 * label band, worn and unevenly inked. Do not substitute a chip, a badge, or a
 * coded imitation — the wear is the point, and it cannot be faked with a border.
 *
 * The label text is part of the artwork, so `label` only retitles the image for
 * screen readers and tooltips; it cannot change what the stamp reads.
 */
export const MONEY_STATES = {
  none: { label: "No payment yet", slug: "no-payment-yet", ink: "#8C8C8C" },
  payment_pending: { label: "Payment pending", slug: "payment-pending", ink: "#E9A23B" },
  payment_held: { label: "In escrow", slug: "in-escrow", ink: "#1D6E9E" },
  payment_released: { label: "Released", slug: "released", ink: "#1B9455" },
  payment_disputed: { label: "In dispute", slug: "in-dispute", ink: "#C22A2A" },
};

const SIZES = { sm: 80, md: 104, lg: 148 };

/* The artwork lives at the design system's root, but a consuming page can sit at
   any depth. Derive the folder from the bundle's own src so the same component
   resolves correctly from a component card, a UI kit, or a template. */
let _base;
/** Absolute-or-relative URL for a stamp PNG by slug. Lowercase on purpose: an
    internal helper, not part of the public namespace. */
export function stampUrl(slug) { return stampBase() + slug + ".png"; }
function stampBase() {
  if (_base === undefined) {
    let found = "assets/stamps/";
    try {
      const tag = document.querySelector('script[src*="_ds_bundle.js"]');
      if (tag) found = tag.getAttribute("src").replace(/_ds_bundle\.js.*$/, "") + "assets/stamps/";
    } catch (e) { /* non-browser render: fall back to the project-root path */ }
    _base = found;
  }
  return _base;
}

export function MoneyStamp({ state = "none", label, size = "md", basePath, style, ...rest }) {
  const s = MONEY_STATES[state] || MONEY_STATES.none;
  const px = SIZES[size] || SIZES.md;
  const alt = label || s.label;
  return (
    <img
      {...rest}
      src={(basePath || stampBase()) + s.slug + ".png"}
      alt={alt}
      title={alt}
      width={px}
      height={px}
      loading="lazy"
      decoding="async"
      style={{ display: "block", flexShrink: 0, width: px, height: px, userSelect: "none", ...style }}
    />
  );
}
