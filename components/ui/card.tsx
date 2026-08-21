import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  // Level 1 of the elevation scale: the card, resting on the ground. Radius is
  // 14px, the system's card radius. The ground is white and the card is
  // off-white, which is a ~2% step — so the hairline and the shadow are what
  // actually separate them, and both are required, never one alone.
  return <div className={cn("rounded-[14px] border border-ink/[0.08] bg-raised shadow-elev-1", className)} {...props} />;
}
export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />;
}
export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("font-semibold leading-none tracking-tight", className)} {...props} />;
}
export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-neutral-500", className)} {...props} />;
}
export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  // min-w-0 + break-words: keep long unbroken text (URLs, emails, names) wrapping
  // inside the card instead of overflowing it, esp. inside flex/grid parents.
  return <div className={cn("min-w-0 break-words p-6 pt-0", className)} {...props} />;
}
export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center p-6 pt-0", className)} {...props} />;
}
