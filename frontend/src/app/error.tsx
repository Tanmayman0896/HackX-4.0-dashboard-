"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application segment error:", error);
  }, [error]);

  return (
    <div className="bg-background flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <div className="border-border bg-card mx-auto max-w-md space-y-4 rounded-xl border p-6 shadow-sm">
        <div className="bg-destructive/10 text-destructive mx-auto flex size-12 items-center justify-center rounded-full">
          <AlertTriangle className="size-6" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-lg font-semibold tracking-tight">
            Something went wrong
          </h2>
          <p className="text-muted-foreground text-sm">
            {error?.message ||
              "An unexpected error occurred while rendering this page."}
          </p>
        </div>
        <Button onClick={() => reset()} variant="outline" className="gap-2">
          <RotateCcw className="size-4" />
          Try again
        </Button>
      </div>
    </div>
  );
}
