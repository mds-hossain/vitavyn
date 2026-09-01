export function VitavynMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} role="img" aria-label="Vitavyn">
      <defs>
        <linearGradient id="vv-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="oklch(0.66 0.1 189)" />
          <stop offset="100%" stopColor="oklch(0.45 0.09 200)" />
        </linearGradient>
      </defs>
      <path d="M6 6 L24 42 L42 6 L33.5 6 L24 26 L14.5 6 Z" fill="url(#vv-mark)" />
      <path d="M24 20 L31 6 L24 6 Z" fill="var(--gold)" opacity="0.95" />
    </svg>
  );
}

export function VitavynLogo({
  className = "",
  markClass = "h-8 w-8",
  tone = "default",
}: {
  className?: string;
  markClass?: string;
  tone?: "default" | "inverse";
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <VitavynMark className={markClass} />
      <span
        className={`font-display text-lg font-semibold tracking-[0.22em] ${
          tone === "inverse" ? "text-sidebar-foreground" : "text-foreground"
        }`}
      >
        VITAVYN
      </span>
    </span>
  );
}
