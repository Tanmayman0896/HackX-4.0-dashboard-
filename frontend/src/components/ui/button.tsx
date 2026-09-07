import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-md",
    "text-[0.8125rem] leading-none font-medium tracking-[-0.005em] whitespace-nowrap",
    "transition-[background-color,border-color,color,box-shadow] duration-150",
    "outline-none focus-visible:ring-2 focus-visible:ring-ring/45 focus-visible:ring-offset-1",
    "focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-40",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
    "aria-invalid:border-destructive",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "bg-hackx border border-hackx text-white hover:bg-hackx-ink hover:border-hackx-ink",
        destructive:
          "bg-destructive border border-destructive text-white hover:brightness-95 focus-visible:ring-destructive/40",
        outline:
          "border border-border bg-card text-foreground hover:bg-accent hover:border-input",
        secondary:
          "border border-transparent bg-secondary text-secondary-foreground hover:bg-accent",
        ghost:
          "border border-transparent text-muted-foreground hover:bg-accent hover:text-foreground",
        link: "text-hackx underline-offset-4 hover:underline",
      },
      size: {
        default: "h-8.5 px-3 has-[>svg]:pl-2.5",
        sm: "h-7.5 rounded-[5px] px-2.5 text-xs has-[>svg]:pl-2",
        lg: "h-10 rounded-md px-5 text-sm has-[>svg]:pl-4",
        icon: "size-8.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
