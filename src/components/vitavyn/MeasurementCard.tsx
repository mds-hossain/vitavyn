import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { ChevronRight } from "lucide-react";
import { Line, LineChart, ResponsiveContainer } from "recharts";
import { KIND_LABELS } from "@/lib/vitavyn/personalize";
import type { Measurement } from "@/lib/vitavyn/types";
import { formatMeasurement, type UnitPrefs } from "@/lib/vitavyn/units";

export function measurementDisplay(m: Measurement, prefs: UnitPrefs) {
  if (m.kind === "blood_pressure") {
    return { value: `${m.value}/${m.secondaryValue ?? "—"}`, unit: "mmHg", secondary: undefined };
  }
  const primary = formatMeasurement(m.kind, m.unit, m.value, prefs);
  const [value, ...rest] = primary.split(" ");
  let secondary: string | undefined;
  if (m.kind === "glucose") {
    const other = prefs.glucoseUnit === "mg/dL" ? "mmol/L" : "mg/dL";
    secondary = formatMeasurement(m.kind, m.unit, m.value, { ...prefs, glucoseUnit: other });
  } else if (m.kind === "weight") {
    const other = prefs.weightUnit === "kg" ? "lb" : "kg";
    secondary = formatMeasurement(m.kind, m.unit, m.value, { ...prefs, weightUnit: other });
  }
  return { value: value ?? "—", unit: rest.join(" "), secondary };
}

export function MeasurementCard({
  kind,
  measurements,
  prefs,
}: {
  kind: string;
  measurements: Measurement[]; // newest first, same kind
  prefs: UnitPrefs;
}) {
  const latest = measurements[0];
  if (!latest) return null;

  const spark = [...measurements]
    .slice(0, 14)
    .reverse()
    .map((m) => ({ v: m.value }));
  const { value, unit, secondary } = measurementDisplay(latest, prefs);

  return (
    <Link
      to="/trends/$kind"
      params={{ kind }}
      aria-label={`View ${KIND_LABELS[kind] ?? kind} trend`}
      className="group flex flex-col rounded-xl border border-border bg-background/60 p-4 transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-muted-foreground">{KIND_LABELS[kind] ?? kind}</p>
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </div>
      <p className="metric-value mt-2 text-3xl leading-none">
        {value}
        {unit ? <span className="ml-1 text-sm text-muted-foreground">{unit}</span> : null}
      </p>
      {secondary ? <p className="mt-1 text-xs text-muted-foreground">{secondary}</p> : null}
      {spark.length >= 3 ? (
        <div className="mt-3 h-10 w-full" aria-hidden>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={spark}>
              <Line type="monotone" dataKey="v" stroke="var(--chart-1)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : null}
      <p className="mt-3 text-xs text-muted-foreground">
        {latest.context ? `${latest.context} · ` : ""}
        {format(new Date(latest.takenAt), "MMM d, HH:mm")}
      </p>
      <span className="mt-2 text-xs font-medium text-primary">View trend</span>
    </Link>
  );
}
