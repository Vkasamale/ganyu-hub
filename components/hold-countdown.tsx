"use client";

import { useEffect, useState } from "react";

// ponytail: 1s tick is fine — panel is tiny and unmounts on navigation.
export function HoldCountdown({ paymentHeldAt, holdMs }: { paymentHeldAt: string; holdMs: number }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const remaining = Math.max(0, new Date(paymentHeldAt).getTime() + holdMs - now);
  if (remaining === 0) return <>Release is available. Refresh the page.</>;
  const h = Math.floor(remaining / 3_600_000);
  const m = Math.floor((remaining % 3_600_000) / 60_000);
  const s = Math.floor((remaining % 60_000) / 1_000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return <>Release opens in {pad(h)}h {pad(m)}m {pad(s)}s.</>;
}
