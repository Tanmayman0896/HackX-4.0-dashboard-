import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Inline notice. A 2px leading edge carries the tone; the fill stays quiet so
 * alerts can sit inside panels without shouting over the content.
 */
const alertVariants = cva(
  [
    "relative grid w-full items-start gap-y-0.5 rounded-md border py-2.5 pr-3 pl-3.5 text-[0.8125rem]",
    "grid-cols-[0_1fr] has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] has-[>svg]:gap-x-2.5",
    "[&>svg]:size-4 [&>svg]:translate-y-0.5",
    "before:absolute before:inset-y-0 before:left-0 before:w-0.5 before:content-['']",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "border-hackx/20 bg-hackx/6 text-foreground before:bg-hackx [&>svg]:text-hackx",
        destructive:
          "border-danger/25 bg-danger/6 text-danger-ink before:bg-danger [&>svg]:text-danger",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "col-start-2 line-clamp-1 min-h-4 font-semibold tracking-tight",
        className,
      )}
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "col-start-2 grid justify-items-start gap-1 text-[0.8125rem] [&_p]:leading-relaxed",
        className,
      )}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription };
