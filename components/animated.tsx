"use client";

import { useEffect, useRef, useState, Children, isValidElement } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";

export function StaggerList({
  children,
  stagger = 0.05,
  className,
}: {
  children: React.ReactNode;
  stagger?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger } } }}
    >
      {Children.map(children, (child, i) => (
        <motion.div
          key={(isValidElement(child) && (child as any).key) || i}
          variants={{
            hidden: { opacity: 0, y: 12 },
            show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.2, 0.8, 0.2, 1] } },
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

export function CountUp({
  value,
  duration = 700,
  format = "number",
}: {
  value: number;
  duration?: number;
  format?: "number" | "mwk";
}) {
  const [n, setN] = useState(0);
  const startRef = useRef<number | null>(null);
  useEffect(() => {
    let raf = 0;
    const step = (t: number) => {
      if (startRef.current == null) startRef.current = t;
      const p = Math.min(1, (t - startRef.current) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    startRef.current = null;
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  const shown = format === "mwk" ? `MWK ${n.toLocaleString()}` : n.toLocaleString();
  return <span className="tabular-nums">{shown}</span>;
}

export function PopScale({
  active,
  children,
  className,
}: {
  active: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.span
      className={className}
      animate={active ? { scale: [1, 1.3, 1] } : { scale: 1 }}
      transition={{ duration: 0.35, times: [0, 0.4, 1], ease: "easeOut" }}
    >
      {children}
    </motion.span>
  );
}

export function Reveal({ open, children }: { open: boolean; children: React.ReactNode }) {
  return (
    <div
      className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
    >
      <div className="overflow-hidden">{children}</div>
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-ink/[0.06] ${className}`} />;
}

export function ChipMorphGroup({ children }: { children: React.ReactNode }) {
  return <LayoutGroup id="filter-chips">{children}</LayoutGroup>;
}
