import * as React from "react";

import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------
   Section — the standard content block: eyebrow + title + actions, then body.
   Replaces the "loose <h2> above a card" pattern used across the dashboards.
------------------------------------------------------------------------- */
export function Section({
  title,
  description,
  actions,
  className,
  children,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className={cn("min-w-0", className)}>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-foreground text-base font-semibold tracking-tight">
            {title}
          </h2>
          {description ? (
            <p className="text-muted-foreground mt-1 text-[0.8125rem]">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        ) : null}
      </div>
      {children}
    </section>
  );
}

/* -------------------------------------------------------------------------
   Panel — a flat bordered surface. Structure comes from the hairline, not
   from elevation, so panels can nest without a shadow pile-up.
------------------------------------------------------------------------- */
export function Panel({
  className,
  ...props
}: React.ComponentProps<"div"> & { accent?: never }) {
  return (
    <div
      className={cn(
        "border-border bg-card rounded-lg border",
        "overflow-hidden",
        className,
      )}
      {...props}
    />
  );
}

export function PanelHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "border-hairline flex items-center justify-between gap-3 border-b px-4 py-3",
        className,
      )}
      {...props}
    />
  );
}

export function PanelTitle({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "text-foreground flex items-center gap-2 text-[0.8125rem] font-semibold tracking-tight",
        "[&_svg]:text-faint [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

export function PanelBody({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className={cn("p-4", className)} {...props} />;
}

/* -------------------------------------------------------------------------
   Metrics — one bordered strip of figures rather than a row of floating
   cards. Cells divide with hairlines and share a single outer edge.
------------------------------------------------------------------------- */
export function MetricRow({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "border-border bg-card grid overflow-hidden rounded-lg border",
        "divide-hairline divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0",
        className,
      )}
      {...props}
    />
  );
}

export function Metric({
  label,
  value,
  hint,
  icon,
  tone = "default",
  className,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon?: React.ReactNode;
  tone?: "default" | "brand" | "ok" | "warn" | "danger" | "info";
  className?: string;
}) {
  const toneClass = {
    default: "text-foreground",
    brand: "text-hackx",
    ok: "text-ok-ink",
    warn: "text-warn-ink",
    danger: "text-danger-ink",
    info: "text-info-ink",
  }[tone];

  return (
    <div className={cn("min-w-0 px-4 py-4", className)}>
      <div className="flex items-center gap-1.5">
        {icon ? (
          <span className="text-faint [&_svg]:size-3.5">{icon}</span>
        ) : null}
        <span className="eyebrow truncate">{label}</span>
      </div>
      <div
        data-numeric
        className={cn(
          "mt-2 text-[1.75rem] leading-none font-semibold tracking-tight",
          toneClass,
        )}
      >
        {value}
      </div>
      {hint ? (
        <p className="text-faint mt-1.5 truncate text-xs">{hint}</p>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------
   Field — a label/value pair. Used wherever the dashboards print a record
   attribute (team name, room, user id, …).
------------------------------------------------------------------------- */
export function Field({
  label,
  children,
  className,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <div className="eyebrow">{label}</div>
      <div className="text-foreground mt-1.5 text-sm font-medium break-words">
        {children}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------
   Empty state
------------------------------------------------------------------------- */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border-border flex flex-col items-center rounded-lg border border-dashed px-6 py-12 text-center",
        className,
      )}
    >
      {icon ? (
        <span className="text-faint mb-3 [&_svg]:size-6">{icon}</span>
      ) : null}
      <p className="text-foreground text-sm font-medium">{title}</p>
      {description ? (
        <p className="text-muted-foreground mt-1 max-w-sm text-[0.8125rem]">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

/* -------------------------------------------------------------------------
   Full-page loading / boot state
------------------------------------------------------------------------- */
export function BootScreen({ label }: { label: string }) {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-6">
      <div className="flex flex-col items-center gap-3">
        <span className="border-border border-t-hackx size-7 animate-spin rounded-full border-2" />
        <p className="eyebrow">{label}</p>
      </div>
    </div>
  );
}
