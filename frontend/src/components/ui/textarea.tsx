import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input bg-card text-foreground flex field-sizing-content min-h-16 w-full rounded-md border px-2.5 py-2",
        "text-[0.8125rem] leading-relaxed transition-[border-color,box-shadow] duration-150 outline-none",
        "placeholder:text-faint hover:border-muted-foreground/40",
        "focus-visible:border-ring focus-visible:ring-ring/25 focus-visible:ring-[3px]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
