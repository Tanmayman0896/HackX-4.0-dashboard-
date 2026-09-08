"use client";

import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { TopLoadingBar } from "@/components/ui/loading-bar";
import React from "react";

export default function LayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      storageKey="hackx-theme"
    >
      <TopLoadingBar />
      {children}
      <Toaster />
    </ThemeProvider>
  );
}
