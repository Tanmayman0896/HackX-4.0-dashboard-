"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useTransition,
  Suspense,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";

interface LoadingBarContextType {
  start: () => void;
  done: () => void;
}

const LoadingBarContext = createContext<LoadingBarContextType>({
  start: () => {},
  done: () => {},
});

export function useLoadingBar() {
  return useContext(LoadingBarContext);
}

function LoadingBarInternal() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [, startTransition] = useTransition();

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const start = useCallback(() => {
    clearTimer();
    setVisible(true);
    setProgress(15);

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearTimer();
          return 90;
        }
        const step = Math.max(1, (90 - prev) * 0.15);
        return Math.min(prev + step, 90);
      });
    }, 120);
  }, []);

  const done = useCallback(() => {
    clearTimer();
    setProgress(100);
    setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        setProgress(0);
      }, 200);
    }, 300);
  }, []);

  // Complete loading bar when pathname or searchParams change
  useEffect(() => {
    done();
  }, [pathname, searchParams, done]);

  // Intercept click on internal links to start loading bar immediately
  useEffect(() => {
    const handleAnchorClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a");

      if (!anchor || !anchor.href) return;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)
        return;

      const url = new URL(anchor.href, window.location.origin);
      if (url.origin === window.location.origin) {
        const currentUrl = new URL(window.location.href);
        if (
          url.pathname !== currentUrl.pathname ||
          url.search !== currentUrl.search
        ) {
          startTransition(() => {
            start();
          });
        }
      }
    };

    document.addEventListener("click", handleAnchorClick, { capture: true });
    return () => {
      document.removeEventListener("click", handleAnchorClick, {
        capture: true,
      });
      clearTimer();
    };
  }, [start]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed top-0 right-0 left-0 z-[9999] h-[2.5px] overflow-hidden"
      style={{
        opacity: visible ? 1 : 0,
        transition: "opacity 200ms ease-out",
      }}
    >
      <div
        className="from-hackx to-hackx h-full bg-gradient-to-r via-blue-500 shadow-[0_0_8px_rgba(67,97,238,0.7)] transition-all ease-out"
        style={{
          width: `${progress}%`,
          transitionDuration: progress === 100 ? "180ms" : "250ms",
        }}
      />
    </div>
  );
}

export function TopLoadingBar() {
  return (
    <Suspense fallback={null}>
      <LoadingBarInternal />
    </Suspense>
  );
}
