import * as React from "react";
import { cn } from "@/lib/utils";

// Styled native <select>. Matches Input's height, border, radius and focus ring
// so dropdowns stop looking like unstyled browser chrome next to our fields.
// Native on purpose: no JS, works before hydration, keyboard + mobile pickers
// come free. `appearance-none` + a background chevron kills the OS arrow.
export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "flex h-10 w-full appearance-none rounded-md border border-ink/15 bg-white bg-no-repeat py-2 pl-3 pr-9 text-sm text-ink",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-50",
        className
      )}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8' fill='none'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%231a1611' stroke-opacity='0.45' stroke-width='1.75' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
        backgroundPosition: "right 0.75rem center",
        backgroundSize: "12px 8px",
      }}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = "Select";
