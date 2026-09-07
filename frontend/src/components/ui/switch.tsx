"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer data-[state=checked]:bg-hackx data-[state=unchecked]:bg-input/70 focus-visible:border-ring focus-visible:ring-ring/40 inline-flex h-[1.125rem] w-[1.875rem] shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-colors duration-150 outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={
          "shadow-e1 pointer-events-none block size-3.5 rounded-full bg-white ring-0 transition-transform duration-150 ease-out data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0"
        }
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
