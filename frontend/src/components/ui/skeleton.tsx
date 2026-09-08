import { cn } from "@/lib/utils";
import React from "react";

interface SkeletonProps extends React.ComponentProps<"div"> {
  shimmer?: boolean;
}

function Skeleton({ className, shimmer = true, ...props }: SkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "bg-muted/80 rounded-md",
        shimmer ? "animate-shimmer" : "animate-pulse",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
