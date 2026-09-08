import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------
   AppShellSkeleton — Matches the AppShell chrome (top header + tabs bar)
------------------------------------------------------------------------- */
export function AppShellSkeleton({
  role = "Dashboard",
  tabCount = 5,
  children,
}: {
  role?: string;
  tabCount?: number;
  children?: React.ReactNode;
}) {
  return (
    <div className="bg-background min-h-screen">
      {/* Top Header */}
      <header className="border-border bg-surface sticky top-0 z-30 border-b">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Skeleton className="size-8 rounded-md" />
            <div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-32" />
                <span className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-[0.6875rem] font-semibold tracking-wider uppercase">
                  {role}
                </span>
              </div>
              <Skeleton className="mt-1 h-3.5 w-24" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Skeleton className="hidden h-8 w-28 rounded-md sm:block" />
            <Skeleton className="size-8 rounded-full" />
          </div>
        </div>

        {/* Tab navigation pills bar */}
        <div className="border-hairline mx-auto max-w-7xl border-t px-4 sm:px-6">
          <div className="scrollbar-slim flex items-center gap-1.5 overflow-x-auto py-2">
            {Array.from({ length: tabCount }).map((_, i) => (
              <Skeleton
                key={i}
                className={cn(
                  "h-8 rounded-md",
                  i === 0 ? "bg-muted w-24" : "bg-muted/60 w-20",
                )}
              />
            ))}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}

/* -------------------------------------------------------------------------
   MetricRowSkeleton — Matches MetricRow component
------------------------------------------------------------------------- */
export function MetricRowSkeleton({ count = 3 }: { count?: number }) {
  const colClass =
    {
      2: "sm:grid-cols-2",
      3: "sm:grid-cols-2 lg:grid-cols-3",
      4: "sm:grid-cols-2 lg:grid-cols-4",
    }[count] || "sm:grid-cols-3";

  return (
    <div
      className={cn(
        "border-border bg-card grid overflow-hidden rounded-lg border",
        "divide-hairline divide-y sm:divide-x sm:divide-y-0",
        colClass,
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="min-w-0 p-4">
          <div className="flex items-center gap-2">
            <Skeleton className="size-3.5 rounded" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="mt-3 h-8 w-16" />
          <Skeleton className="mt-2 h-3 w-28" />
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------
   CardListSkeleton — List of panels / cards
------------------------------------------------------------------------- */
export function CardListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="border-border bg-card rounded-lg border p-4 shadow-sm"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-16 rounded-full" />
                <Skeleton className="h-4 w-20 rounded-full" />
              </div>
              <Skeleton className="h-3.5 w-64" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-20 rounded-md" />
              <Skeleton className="h-8 w-24 rounded-md" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------
   TableSkeleton — Generic table / list with search bar
------------------------------------------------------------------------- */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      {/* Search & filters bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-9 w-full max-w-sm rounded-md" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24 rounded-md" />
          <Skeleton className="h-9 w-28 rounded-md" />
        </div>
      </div>

      {/* Table rows */}
      <div className="border-border bg-card overflow-hidden rounded-lg border">
        <div className="border-hairline bg-muted/40 flex items-center justify-between border-b px-4 py-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="divide-hairline divide-y">
          {Array.from({ length: rows }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-4 w-14 rounded-full" />
                </div>
                <Skeleton className="h-3 w-48" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-7 w-12 rounded" />
                <Skeleton className="h-7 w-12 rounded" />
                <Skeleton className="h-7 w-12 rounded" />
                <Skeleton className="h-7 w-20 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------
   EvaluationCardsSkeleton — Judge evaluation cards
------------------------------------------------------------------------- */
export function EvaluationCardsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="border-border bg-card relative overflow-hidden rounded-lg border"
        >
          <div className="border-hairline flex items-start justify-between border-b px-4 py-3">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-44" />
                <Skeleton className="h-4 w-16 rounded-full" />
                <Skeleton className="h-4 w-20 rounded-full" />
              </div>
              <Skeleton className="h-3.5 w-60" />
            </div>
            <Skeleton className="h-6 w-12 rounded" />
          </div>
          <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-7 w-20 rounded" />
              <Skeleton className="h-7 w-28 rounded" />
            </div>
            <Skeleton className="h-8 w-24 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------
   ProblemStatementsSkeleton — Domain cards grid + statement list
------------------------------------------------------------------------- */
export function ProblemStatementsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-44" />
        <Skeleton className="h-8 w-32 rounded-md" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="border-border bg-card rounded-lg border p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-4 w-16 rounded-full" />
            </div>
            <Skeleton className="mt-3 h-3 w-36" />
          </div>
        ))}
      </div>

      <div className="space-y-4 pt-2">
        <Skeleton className="h-6 w-48" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="border-border bg-card rounded-lg border p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="w-full space-y-2">
                <Skeleton className="h-5 w-64" />
                <Skeleton className="h-3.5 w-full max-w-xl" />
                <Skeleton className="h-3.5 w-full max-w-md" />
              </div>
              <Skeleton className="size-8 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------
   MentorQueueSkeleton — Mentor status and waiting queue
------------------------------------------------------------------------- */
export function MentorQueueSkeleton() {
  return (
    <div className="space-y-6">
      <MetricRowSkeleton count={3} />
      <div className="border-border bg-card rounded-lg border p-4">
        <div className="border-hairline flex items-center justify-between border-b pb-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24 rounded-full" />
        </div>
        <div className="divide-hairline divide-y pt-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-3.5">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-16 rounded-full" />
                </div>
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-8 w-28 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------
   ActivityLogsSkeleton — Log entries list
------------------------------------------------------------------------- */
export function ActivityLogsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row">
        <Skeleton className="h-9 w-full rounded-md md:w-1/2" />
        <Skeleton className="h-9 w-full rounded-md md:w-1/4" />
        <Skeleton className="h-9 w-full rounded-md md:w-1/4" />
      </div>
      <div className="border-border bg-card overflow-hidden rounded-lg border">
        <div className="divide-hairline divide-y">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-24 rounded" />
                  <Skeleton className="h-4 w-28" />
                </div>
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-3.5 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------
   Full Dashboard Skeletons
------------------------------------------------------------------------- */

export function TeamDashboardSkeleton() {
  return (
    <AppShellSkeleton role="Participant" tabCount={6}>
      <div className="space-y-6">
        <div className="border-border bg-card rounded-lg border p-4">
          <div className="border-hairline flex items-center justify-between border-b pb-3">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="divide-hairline divide-y">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between py-3.5">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-5 w-20 rounded" />
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="border-border bg-card space-y-4 rounded-lg border p-4">
            <Skeleton className="h-5 w-28" />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-28" />
              </div>
            </div>
          </div>
          <div className="border-border bg-card space-y-4 rounded-lg border p-4">
            <Skeleton className="h-5 w-32" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-56" />
            </div>
          </div>
        </div>
      </div>
    </AppShellSkeleton>
  );
}

export function JudgeDashboardSkeleton() {
  return (
    <AppShellSkeleton role="Judge" tabCount={2}>
      <div className="space-y-6">
        <MetricRowSkeleton count={3} />
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-8 w-32 rounded-md" />
          </div>
          <EvaluationCardsSkeleton count={4} />
        </div>
      </div>
    </AppShellSkeleton>
  );
}

export function MentorDashboardSkeleton() {
  return (
    <AppShellSkeleton role="Mentor" tabCount={2}>
      <div className="space-y-6">
        <MentorQueueSkeleton />
      </div>
    </AppShellSkeleton>
  );
}

export function AdminDashboardSkeleton() {
  return (
    <AppShellSkeleton role="Admin" tabCount={6}>
      <div className="space-y-6">
        <MetricRowSkeleton count={4} />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="border-border bg-card space-y-3 rounded-lg border p-4">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-3.5 w-60" />
            <div className="space-y-2 pt-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-muted/50 flex items-center justify-between rounded p-2.5"
                >
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-16 rounded" />
                </div>
              ))}
            </div>
          </div>
          <div className="border-border bg-card space-y-3 rounded-lg border p-4">
            <Skeleton className="h-5 w-36" />
            <div className="space-y-2.5 pt-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-muted/50 flex items-center justify-between rounded p-2.5"
                >
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <div className="flex gap-1.5">
                    <Skeleton className="h-5 w-10 rounded" />
                    <Skeleton className="h-5 w-10 rounded" />
                    <Skeleton className="h-5 w-10 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShellSkeleton>
  );
}

export function SuperAdminDashboardSkeleton() {
  return (
    <AppShellSkeleton role="Super Admin" tabCount={10}>
      <div className="space-y-6">
        <MetricRowSkeleton count={3} />
        <div className="border-border bg-card overflow-hidden rounded-lg border">
          <div className="border-hairline flex items-center justify-between border-b px-4 py-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="divide-hairline grid divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3.5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-5 w-14 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShellSkeleton>
  );
}

export function LoginSkeleton() {
  return (
    <div className="bg-background relative min-h-screen lg:grid lg:grid-cols-[1.05fr_1fr]">
      <aside className="border-hairline relative flex flex-col justify-between border-b p-8 sm:p-10 lg:border-r lg:border-b-0 lg:p-12">
        <div className="space-y-4">
          <Skeleton className="h-8 w-36" />
          <Skeleton className="mt-8 h-12 w-64" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="hidden space-y-2 lg:block">
          <Skeleton className="h-3 w-20" />
          <div className="flex gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-20" />
            ))}
          </div>
        </div>
      </aside>
      <main className="flex flex-col justify-center px-6 py-10 sm:px-10 lg:min-h-screen">
        <div className="mx-auto w-full max-w-[22rem] space-y-5">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-60" />
          <div className="space-y-4 pt-4">
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </div>
      </main>
    </div>
  );
}
