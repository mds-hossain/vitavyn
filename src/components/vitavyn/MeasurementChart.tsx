import { useState } from "react";
import { format } from "date-fns";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Panel } from "./primitives";
import type { Measurement } from "@/lib/vitavyn/types";

const RANGES = [
  { id: "7", label: "7 days", days: 7 },
  { id: "30", label: "30 days", days: 30 },
  { id: "90", label: "3 months", days: 90 },
  { id: "all", label: "All", days: 3650 },
];

export function MeasurementChart({
  measurements,
  title = "Trend",
}: {
  measurements: Measurement[];
  title?: string;
}) {
  const [range, setRange] = useState("30");
  const days = RANGES.find((r) => r.id === range)?.days ?? 30;
  const cutoff = Date.now() - days * 86400000;

  const points = measurements
    .filter((m) => new Date(m.takenAt).getTime() >= cutoff)
    .sort((a, b) => new Date(a.takenAt).getTime() - new Date(b.takenAt).getTime())
    .map((m) => ({
      date: format(new Date(m.takenAt), "MMM d"),
      value: m.value,
      secondary: m.secondaryValue ?? null,
    }));

  return (
    <Panel
      title={title}
      action={
        <div className="flex gap-1">
          {RANGES.map((r) => (
            <button
              key={r.id}
              onClick={() => setRange(r.id)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                range === r.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      }
    >
      {points.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          No readings recorded in this period.
        </p>
      ) : (
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
      )}
    </Panel>
  );
}
