"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";

/**
 * Light/dark theme toggle. Light is the default (see LayoutClient).
 * Renders a fixed-size placeholder until mounted so the header never
 * shifts and the server/client markup stays in sync.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  const toggle = React.useCallback(() => {
    const root = document.documentElement;
    root.classList.add("theme-transition");
    window.setTimeout(() => root.classList.remove("theme-transition"), 260);
    setTheme(isDark ? "light" : "dark");
  }, [isDark, setTheme]);

  const base = cn(
    "relative inline-flex size-8.5 shrink-0 cursor-pointer items-center justify-center",
    "rounded-md border border-border bg-card text-muted-foreground",
    "transition-colors duration-150 outline-none",
    "hover:bg-accent hover:text-foreground hover:border-input",
    "focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:border-ring",
    className,
  );

  if (!mounted) {
    // Placeholder keeps layout stable before the theme is known.
    return <div aria-hidden className={cn(base, "opacity-0")} />;
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className={base}
    >
      <Sun
        className={cn(
          "absolute size-4 transition-all duration-300 ease-out",
          isDark
            ? "scale-50 -rotate-90 opacity-0"
            : "scale-100 rotate-0 opacity-100",
        )}
      />
      <Moon
        className={cn(
          "absolute size-4 transition-all duration-300 ease-out",
          isDark
            ? "scale-100 rotate-0 opacity-100"
            : "scale-50 rotate-90 opacity-0",
        )}
      />
    </button>
  );
}

export default ThemeToggle;
