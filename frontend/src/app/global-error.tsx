"use client";

import React, { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global application error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-background text-foreground flex min-h-screen flex-col items-center justify-center p-6">
        <div className="mx-auto max-w-md space-y-4 text-center">
          <h2 className="text-xl font-bold tracking-tight">
            Something went wrong
          </h2>
          <p className="text-muted-foreground text-sm">
            {error?.message || "An unexpected application error occurred."}
          </p>
          <button
            onClick={() => reset()}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium transition-colors"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
