"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@/lib/utils";

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col", className)}
      {...props}
    />
  );
}

/**
 * Navigation list. A vertical rail — in the sidebar on desktop, inside the
 * shell's drawer on smaller screens.
 */
function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn("flex w-full flex-col gap-0.5", className)}
      {...props}
    />
  );
}

/**
 * Navigation item. The active state is a tinted surface with a 2px accent
 * edge, echoing the stroke weight of the X mark.
 */
function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "group/nav relative flex shrink-0 cursor-pointer items-center gap-2.5 rounded-md",
        "px-3 py-2 text-[0.8125rem] font-medium whitespace-nowrap",
        "text-muted-foreground transition-colors duration-150 outline-none",
        "hover:bg-accent hover:text-foreground",
        "focus-visible:ring-ring/40 focus-visible:ring-2",
        "disabled:pointer-events-none disabled:opacity-40",
        "data-[state=active]:bg-hackx-soft data-[state=active]:text-hackx-ink",
        "data-[state=active]:font-semibold",
        // Accent edge, echoing the stroke weight of the X mark.
        "before:bg-hackx before:absolute before:inset-y-1.5 before:left-0 before:w-0.5 before:opacity-0",
        "before:rounded-full before:transition-opacity before:content-['']",
        "data-[state=active]:before:opacity-100",
        "[&_svg]:size-4 [&_svg]:shrink-0",
        "[&_svg]:text-faint data-[state=active]:[&_svg]:text-hackx",
        "w-full justify-start",
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
