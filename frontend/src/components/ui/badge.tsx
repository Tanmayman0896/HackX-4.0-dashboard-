import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Status chip. Signal variants carry a leading dot so state is readable
 * without relying on colour alone; neutral variants stay bare.
 */
const badgeVariants = cva(
  [
    "inline-flex w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden",
    "rounded border px-1.5 py-0.5 text-[0.6875rem] leading-4 font-medium whitespace-nowrap",
    "transition-colors duration-150",
    "[&>svg]:pointer-events-none [&>svg]:size-3",
    "focus-visible:ring-ring/40 focus-visible:ring-2",
    // Dot marker, enabled per-variant.
    "before:hidden before:size-1.5 before:shrink-0 before:rounded-full before:bg-current before:content-['']",
    "data-[dot=true]:before:block",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "border-hackx/25 bg-hackx/10 text-hackx-ink",
        secondary: "border-border bg-muted text-muted-foreground",
        outline: "border-border bg-transparent text-muted-foreground",
        destructive: "border-danger/25 bg-danger/10 text-danger-ink",
        green: "border-ok/25 bg-ok/10 text-ok-ink",
        yellow: "border-warn/30 bg-warn/12 text-warn-ink",
        red: "border-danger/25 bg-danger/10 text-danger-ink",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const DOTTED = new Set(["green", "yellow", "red", "destructive"]);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      data-dot={DOTTED.has(variant ?? "default")}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
