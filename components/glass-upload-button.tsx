"use client";

import { forwardRef, type ReactNode } from "react";

// Glassy pill upload button. Cloud-up icon, soft inner highlight, chromatic
// edge glow on hover. Wire it up as a plain trigger — parent owns the hidden
// <input type="file">.
// ponytail: no webgl / no filter shaders. Pure CSS approximation of the
// Dribbble shader reference. Upgrade path is a canvas layer, if it ever
// matters more than build cost.

type Size = "sm" | "md" | "lg";

const SIZE_CLASSES: Record<Size, { pad: string; text: string; icon: string; gap: string }> = {
  sm: { pad: "px-4 py-1.5",  text: "text-xs",  icon: "h-3.5 w-3.5", gap: "gap-1.5" },
  md: { pad: "px-5 py-2.5",  text: "text-sm",  icon: "h-4 w-4",     gap: "gap-2"   },
  lg: { pad: "px-7 py-3.5",  text: "text-base",icon: "h-5 w-5",     gap: "gap-2.5" },
};

export const GlassUploadButton = forwardRef<
  HTMLButtonElement,
  {
    onClick?: () => void;
    disabled?: boolean;
    children?: ReactNode;
    size?: Size;
    className?: string;
    "aria-label"?: string;
  }
>(function GlassUploadButton(
  { onClick, disabled, children = "Upload", size = "md", className = "", ...rest },
  ref,
) {
  const s = SIZE_CLASSES[size];
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      disabled={disabled}
      {...rest}
      className={
        `group relative isolate inline-flex items-center justify-center rounded-full font-medium tracking-tight text-ink/90 ` +
        `bg-gradient-to-b from-white to-neutral-100 ` +
        `ring-1 ring-inset ring-black/5 ` +
        `shadow-[inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_2px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.06),0_4px_10px_rgba(0,0,0,0.05)] ` +
        `transition-all duration-200 ease-out ` +
        `hover:-translate-y-px ` +
        `hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.95),inset_0_-1px_3px_rgba(0,0,0,0.08),0_2px_6px_rgba(0,0,0,0.1),0_10px_24px_rgba(0,0,0,0.08)] ` +
        `active:translate-y-0 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.12)] ` +
        `disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_2px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.06),0_4px_10px_rgba(0,0,0,0.05)] ` +
        `${s.pad} ${s.text} ${s.gap} ${className}`
      }
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-1 -z-10 rounded-full opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-70"
        style={{
          background:
            "conic-gradient(from 90deg at 50% 50%, #ff2d92, #7c3aed, #06b6d4, #10b981, #ff2d92)",
        }}
      />
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={s.icon}>
        <path d="M17.5 19a4.5 4.5 0 001-8.9 6 6 0 00-11.6-1.6A4.5 4.5 0 006.5 19h11z" />
        <line x1="12" y1="12" x2="12" y2="17" />
        <polyline points="9.5 14.5 12 12 14.5 14.5" />
      </svg>
      <span>{children}</span>
    </button>
  );
});
