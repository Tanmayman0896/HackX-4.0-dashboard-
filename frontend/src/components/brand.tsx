import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * The HackX X mark. Inlined (rather than <img src="/x-logo.svg">) so it can
 * inherit `currentColor` and follow the active theme; the same artwork is
 * available as a static asset at /x-logo.svg.
 */
export function XMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 697 766"
      fill="none"
      aria-hidden
      className={cn("h-4 w-auto", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 0H261.016L435.44 306.784L696.456 765.873H435.44L261.016 459.089L0 0Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M261.016 765.873H0L261.016 459.089V765.873Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M435.44 0H696.456L435.44 306.784V0Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * Brand lockup: the mark in a tinted tile, with the wordmark and the role
 * this dashboard belongs to.
 */
export function BrandLockup({
  role,
  compact = false,
  className,
}: {
  role?: string;
  /** Drop to the mark alone on very narrow screens, where the title bar also
   *  has to fit page actions. */
  compact?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex shrink-0 items-center gap-2.5", className)}>
      <span className="border-hackx bg-hackx flex size-8 shrink-0 items-center justify-center rounded-md border text-white">
        <XMark className="h-3.5" />
      </span>
      <span
        className={cn(
          "min-w-0 leading-none",
          compact && "hidden min-[430px]:block",
        )}
      >
        <span className="text-foreground block text-[0.9375rem] font-semibold tracking-tight whitespace-nowrap">
          MUJ HackX <span className="text-faint font-normal">4.0</span>
        </span>
        {role ? (
          <span className="eyebrow mt-1 block truncate">{role}</span>
        ) : null}
      </span>
    </div>
  );
}
