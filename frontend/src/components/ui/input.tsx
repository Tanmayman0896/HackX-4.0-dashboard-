import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "border-input bg-card text-foreground flex h-8.5 w-full min-w-0 rounded-md border px-2.5",
        "text-[0.8125rem] transition-[border-color,box-shadow] duration-150 outline-none",
        "placeholder:text-faint selection:bg-hackx/20 selection:text-foreground",
        "file:text-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-xs file:font-medium",
        "hover:border-muted-foreground/40",
        "focus-visible:border-ring focus-visible:ring-ring/25 focus-visible:ring-[3px]",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
