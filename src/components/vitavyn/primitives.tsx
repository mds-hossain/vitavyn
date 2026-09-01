import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string | undefined;
  actions?: ReactNode | undefined;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
        {description ? (
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function Panel({
  children,
  className,
  title,
  action,
}: {
  children: ReactNode;
  className?: string | undefined;
  title?: string | undefined;
  action?: ReactNode | undefined;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-border bg-surface p-5 text-surface-foreground shadow-[var(--shadow-card)]",
        className,
      )}
    >
      {title || action ? (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title ? (
            <h2 className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {title}
            </h2>
          ) : (
            <span />
          )}
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function MetricTile({
  label,
  value,
  unit,
  secondary,
  context,
  tone = "neutral",
}: {
  label: string;
  value: string;
  unit?: string | undefined;
  secondary?: string | undefined;
  context?: string | undefined;
  tone?: "neutral" | "success" | "warning" | "attention" | undefined;
}) {
  const toneClass = {
    neutral: "text-foreground",
    success: "text-success",
    warning: "text-warning",
    attention: "text-destructive",
  }[tone];

  return (
    <div className="rounded-xl border border-border bg-background/60 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={cn("metric-value mt-2 text-3xl", toneClass)}>
        {value}
        {unit ? <span className="ml-1 text-base text-muted-foreground">{unit}</span> : null}
      </p>
      {secondary ? <p className="mt-1 text-sm text-muted-foreground">{secondary}</p> : null}
      {context ? <p className="mt-2 text-xs text-muted-foreground">{context}</p> : null}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode | undefined;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface/60 px-6 py-12 text-center">
      <h3 className="font-display text-base font-semibold">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function StatusPill({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "warning" | "attention" | "brand" | undefined;
}) {
  const map = {
    neutral: "bg-muted text-muted-foreground",
    success: "bg-success/12 text-success",
    warning: "bg-warning/18 text-warning-foreground",
    attention: "bg-destructive/12 text-destructive",
    brand: "bg-accent text-accent-foreground",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
        map[tone],
      )}
    >
      {children}
    </span>
  );
}

export function SafetyNote({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border border-border bg-muted/60 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
      {children}
    </p>
  );
}
