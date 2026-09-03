import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState, Panel, SafetyNote } from "@/components/vitavyn/primitives";
import { measurementDisplay } from "@/components/vitavyn/MeasurementCard";
import { KIND_LABELS, measurementsOfKind } from "@/lib/vitavyn/personalize";
import { useVitavyn } from "@/lib/vitavyn/store";
import { round } from "@/lib/vitavyn/units";

export const Route = createFileRoute("/trends/$kind")({
  head: () => ({
    meta: [
      { title: "Measurement trend — Vitavyn" },
      {
        name: "description",
        content: "Detailed trend view with 7 day, 30 day, 3 month and custom ranges for your recorded measurements.",
      },
      { property: "og:title", content: "Measurement trend — Vitavyn" },
      { property: "og:description", content: "Averages, ranges and recent readings from your own records." },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    condition: typeof search["condition"] === "string" ? (search["condition"] as string) : "",
  }),
  component: TrendPage,
});

const RANGES = [
  { id: "7", label: "7 days", days: 7 },
  { id: "30", label: "30 days", days: 30 },
  { id: "90", label: "3 months", days: 90 },
  { id: "custom", label: "Custom", days: 0 },
];

function TrendPage() {
  const { kind } = Route.useParams();
  const { condition: conditionId } = Route.useSearch();
  const { data } = useVitavyn();
  const [range, setRange] = useState("30");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const backCondition = conditionId ? data.conditions.find((c) => c.id === conditionId) : undefined;
  const label = KIND_LABELS[kind] ?? kind;
  const all = measurementsOfKind(data, kind);

  const filtered = all.filter((m) => {
    const t = new Date(m.takenAt).getTime();
    if (range === "custom") {
      if (from && t < new Date(from).getTime()) return false;
      if (to && t > new Date(to).getTime() + 86399000) return false;
      return true;
    }
    const days = RANGES.find((r) => r.id === range)?.days ?? 30;
    return t >= Date.now() - days * 86400000;
  });

  const values = filtered.map((m) => m.value);
  const stat = (fn: (v: number[]) => number) => (values.length ? round(fn(values), 1) : null);
  const avg = stat((v) => v.reduce((a, b) => a + b, 0) / v.length);
  const min = stat((v) => Math.min(...v));
  const max = stat((v) => Math.max(...v));

  const points = [...filtered]
    .reverse()
    .map((m) => ({
      date: format(new Date(m.takenAt), "MMM d"),
      value: m.value,
      secondary: m.secondaryValue ?? null,
    }));

  return (
    <div className="space-y-5">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          {backCondition ? (
            <Link to="/conditions/$conditionId" params={{ conditionId: backCondition.id }}>
              <ArrowLeft className="h-4 w-4" /> {backCondition.name}
            </Link>
          ) : (
            <Link to="/measurements">
              <ArrowLeft className="h-4 w-4" /> Measurements
            </Link>
          )}
        </Button>
        <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">{label} trend</h1>
        <p className="mt-1 text-sm text-muted-foreground">Based on the readings you have recorded.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {RANGES.map((r) => (
          <button
            key={r.id}
            onClick={() => setRange(r.id)}
            aria-pressed={range === r.id}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              range === r.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {range === "custom" ? (
        <div className="grid grid-cols-2 gap-3 sm:max-w-md">
          <label className="text-xs text-muted-foreground">
            From
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </label>
          <label className="text-xs text-muted-foreground">
            To
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </label>
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <EmptyState
          title="No readings in this period"
          description="Record a reading or widen the date range to see the trend."
        />
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Average", value: avg },
              { label: "Minimum", value: min },
              { label: "Maximum", value: max },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-border bg-surface p-4">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="metric-value mt-1 text-2xl">{s.value ?? "—"}</p>
              </div>
            ))}
          </div>

          <Panel title="Trend">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                      color: "var(--popover-foreground)",
                      fontSize: 12,
                    }}
                  />
                  <Line type="monotone" dataKey="value" stroke="var(--chart-1)" strokeWidth={2.5} dot={false} />
                  {points.some((p) => p.secondary !== null) ? (
                    <Line type="monotone" dataKey="secondary" stroke="var(--chart-2)" strokeWidth={2} dot={false} />
                  ) : null}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel title="Recent readings">
            <ul className="divide-y divide-border">
              {filtered.slice(0, 12).map((m) => {
                const d = measurementDisplay(m, data.preferences);
                return (
                  <li key={m.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="metric-value text-base">
                        {d.value} <span className="text-xs text-muted-foreground">{d.unit}</span>
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {m.context ? `${m.context} · ` : ""}
                        {format(new Date(m.takenAt), "EEE, MMM d · HH:mm")}
                      </p>
                    </div>
                    {d.secondary ? (
                      <span className="text-xs text-muted-foreground">{d.secondary}</span>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </Panel>
        </>
      )}

      <SafetyNote>
        Based on your recorded data only. Patterns shown here are observations, not a diagnosis —
        consider discussing anything unexpected with your healthcare professional.
      </SafetyNote>
    </div>
  );
}
