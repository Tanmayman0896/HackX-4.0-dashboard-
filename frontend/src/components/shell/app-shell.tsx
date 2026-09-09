"use client";

import * as React from "react";
import { ChevronDown, LogOut, Menu } from "lucide-react";

import { BrandLockup } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { authService } from "@/lib/auth";
import { cn } from "@/lib/utils";

interface AppShellProps {
  /** Role label shown under the wordmark, e.g. "Participant". */
  role: string;
  /** Page heading, shown in the title bar. */
  title: string;
  /** Optional line under the heading. */
  subtitle?: React.ReactNode;
  /**
   * Navigation. Pass the page's <TabsList>: this component renders inside
   * <Tabs>, so Radix context still reaches it wherever it lands in the DOM.
   */
  nav: React.ReactNode;
  /** Title-bar controls. The theme toggle is appended automatically. */
  actions?: React.ReactNode;
  /** Signed-in identity, pinned to the foot of the rail. */
  identity?: React.ReactNode;
  /** Whether to show the logout action. Defaults to true. */
  showLogout?: boolean;
  children: React.ReactNode;
}

/**
 * Reads the label of whichever nav item is currently selected.
 *
 * The desktop rail stays mounted at every breakpoint (it is only display:none
 * below `lg`), so observing it gives the active section on phones too. Both
 * nav shapes are covered: Radix tabs mark themselves with `data-state`, and
 * the judge dashboard's round switcher uses `aria-current`.
 */
function useActiveNavLabel(ref: React.RefObject<HTMLElement | null>) {
  const [label, setLabel] = React.useState("");

  React.useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const read = () => {
      const active = root.querySelector<HTMLElement>(
        '[role="tab"][data-state="active"], [aria-current="true"]',
      );
      setLabel(active?.textContent?.trim() ?? "");
    };

    read();
    const observer = new MutationObserver(read);
    observer.observe(root, {
      subtree: true,
      attributes: true,
      attributeFilter: ["data-state", "aria-current"],
    });
    return () => observer.disconnect();
  }, [ref]);

  return label;
}

/**
 * Persistent dashboard chrome: brand + navigation rail on the left, a sticky
 * title bar across the top, content beneath.
 *
 * Under `lg` the rail becomes a drawer. The header carries a section selector
 * showing where you are; tapping it slides the same rail in from the left.
 */
export function AppShell({
  role,
  title,
  subtitle,
  nav,
  actions,
  identity,
  showLogout = true,
  children,
}: AppShellProps) {
  const railRef = React.useRef<HTMLElement>(null);
  const activeLabel = useActiveNavLabel(railRef);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [logoutOpen, setLogoutOpen] = React.useState(false);

  const handleLogout = React.useCallback(() => {
    authService.logout();
  }, []);

  // Selecting a destination should dismiss the drawer. Delegated so the pages
  // can keep passing a plain <TabsList> with no extra wiring.
  const closeOnSelect = React.useCallback((event: React.MouseEvent) => {
    if ((event.target as HTMLElement).closest("button")) setMenuOpen(false);
  }, []);

  return (
    <div className="bg-background min-h-screen lg:grid lg:grid-cols-[15.5rem_minmax(0,1fr)]">
      <aside className="border-hairline bg-sidebar sticky top-0 hidden h-screen flex-col border-r lg:flex">
        <div className="border-hairline flex h-14 shrink-0 items-center border-b px-5">
          <BrandLockup role={role} />
        </div>

        <nav
          ref={railRef}
          className="scrollbar-slim min-h-0 flex-1 overflow-y-auto px-3 py-4"
        >
          {nav}
        </nav>

        {identity || showLogout ? (
          <div className="border-hairline flex shrink-0 items-center justify-between gap-2 border-t px-4 py-3">
            {identity ? (
              <div className="min-w-0 flex-1">{identity}</div>
            ) : (
              <div className="text-muted-foreground min-w-0 flex-1 truncate text-xs font-medium">
                {role}
              </div>
            )}
            {showLogout && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setLogoutOpen(true)}
                className="text-muted-foreground hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive size-8 shrink-0 rounded-md transition-colors"
                title="Log out"
                aria-label="Log out"
              >
                <LogOut className="size-3.5" />
              </Button>
            )}
          </div>
        ) : null}
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="border-hairline bg-background/85 sticky top-0 z-30 border-b backdrop-blur-md">
          <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
            <BrandLockup role={role} compact className="lg:hidden" />

            <div className="hidden min-w-0 flex-1 lg:block">
              <h1 className="text-foreground truncate text-[0.9375rem] leading-tight font-semibold tracking-tight">
                {title}
              </h1>
              {subtitle ? (
                <p className="text-faint truncate text-xs leading-tight">
                  {subtitle}
                </p>
              ) : null}
            </div>

            <div className="ml-auto flex min-w-0 shrink-0 items-center gap-2">
              {actions}
              <ThemeToggle />
              {showLogout && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setLogoutOpen(true)}
                  className="border-border bg-card text-muted-foreground hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive h-8.5 gap-1.5 px-2.5 text-xs font-medium transition-colors"
                  title="Log out"
                  aria-label="Log out"
                >
                  <LogOut className="size-3.5" />
                  <span className="hidden sm:inline">Log out</span>
                </Button>
              )}
            </div>
          </div>

          {/* Section selector — the phone/tablet entry point to the rail. */}
          <div className="border-hairline border-t px-4 py-2 sm:px-6 lg:hidden">
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger
                className={cn(
                  "border-border bg-card flex w-full cursor-pointer items-center gap-2.5 rounded-md border px-3 py-2",
                  "text-[0.8125rem] font-medium transition-colors duration-150 outline-none",
                  "hover:bg-accent focus-visible:ring-ring/40 focus-visible:ring-2",
                )}
                aria-label="Open section menu"
              >
                <Menu className="text-faint size-4 shrink-0" />
                <span className="eyebrow">Section</span>
                <span className="text-foreground min-w-0 flex-1 truncate text-left">
                  {activeLabel}
                </span>
                <ChevronDown className="text-faint size-4 shrink-0" />
              </SheetTrigger>

              <SheetContent
                side="left"
                className="w-[17rem] gap-0 p-0 sm:max-w-[17rem]"
              >
                <SheetTitle className="sr-only">Sections</SheetTitle>

                <div className="border-hairline flex h-14 shrink-0 items-center border-b px-5">
                  <BrandLockup role={role} />
                </div>

                <nav
                  onClick={closeOnSelect}
                  className="scrollbar-slim min-h-0 flex-1 overflow-y-auto px-3 py-4"
                >
                  {nav}
                </nav>

                {identity || showLogout ? (
                  <div className="border-hairline flex shrink-0 items-center justify-between gap-2 border-t px-4 py-3">
                    {identity ? (
                      <div className="min-w-0 flex-1">{identity}</div>
                    ) : (
                      <div className="text-muted-foreground min-w-0 flex-1 truncate text-xs font-medium">
                        {role}
                      </div>
                    )}
                    {showLogout && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setMenuOpen(false);
                          setLogoutOpen(true);
                        }}
                        className="text-muted-foreground hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive size-8 shrink-0 rounded-md transition-colors"
                        title="Log out"
                        aria-label="Log out"
                      >
                        <LogOut className="size-3.5" />
                      </Button>
                    )}
                  </div>
                ) : null}
              </SheetContent>
            </Sheet>
          </div>
        </header>

        <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base font-semibold">
                <LogOut className="text-destructive size-4" />
                Log out
              </DialogTitle>
              <DialogDescription className="text-sm">
                Are you sure you want to log out of HackX 4.0? You will need to
                sign in again to access the dashboard.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-row justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLogoutOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleLogout}
                className="gap-1.5"
              >
                <LogOut className="size-3.5" />
                Log out
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8">
          <div className="mx-auto w-full max-w-[86rem]">
            <div className="border-hairline mb-6 border-b pb-4 lg:hidden">
              <h1 className="text-foreground text-lg font-semibold tracking-tight">
                {title}
              </h1>
              {subtitle ? (
                <p className="text-faint mt-0.5 text-xs">{subtitle}</p>
              ) : null}
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

/** Signed-in user block for the rail foot: monogram, name, meta. */
export function ShellIdentity({
  name,
  meta,
  className,
}: {
  name: string;
  meta?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span className="bg-muted text-muted-foreground border-hairline flex size-7 shrink-0 items-center justify-center rounded-md border text-[0.6875rem] font-semibold">
        {name.trim().charAt(0).toUpperCase() || "?"}
      </span>
      <span className="min-w-0 leading-tight">
        <span className="text-foreground block truncate text-[0.8125rem] font-medium">
          {name}
        </span>
        {meta ? (
          <span className="text-faint block truncate text-[0.6875rem]">
            {meta}
          </span>
        ) : null}
      </span>
    </div>
  );
}
