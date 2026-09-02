import { frequencyLabel } from "@/lib/vitavyn/medication";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { format, subDays } from "date-fns";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, Panel, SafetyNote } from "@/components/vitavyn/primitives";
import { useVitavyn } from "@/lib/vitavyn/store";

export const Route = createFileRoute("/report")({
  head: () => ({
    meta: [
      { title: "Doctor report — Vitavyn" },
      {
        name: "description",
        content: "Generate a clean, printable summary of measurements, medications and symptoms for your next visit.",
      },
      { property: "og:title", content: "Doctor report — Vitavyn" },
      { property: "og:description", content: "A printable summary your doctor can actually read." },
    ],
  }),
  component: ReportPage,
});

const RANGES = [
  { id: "30", label: "Last 30 days", days: 30 },
  { id: "90", label: "Last 3 months", days: 90 },
  { id: "365", label: "Last year", days: 365 },
];

function ReportPage() {
  const { data } = useVitavyn();
  const [range, setRange] = useState("30");
  const days = RANGES.find((r) => r.id === range)?.days ?? 30;
  const cutoff = subDays(new Date(), days);

  const measurements = data.measurements.filter((m) => new Date(m.takenAt) >= cutoff);
  const symptoms = data.symptoms.filter((s) => new Date(s.occurredAt) >= cutoff);
  const logs = data.medicationLogs.filter((l) => new Date(l.scheduledFor) >= cutoff);
  const adherence = logs.length
    ? Math.round((logs.filter((l) => l.status === "recorded").length / logs.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Doctor report"
        description="A summary you can print or save as PDF and hand over in the consulting room."
        actions={
          <Button onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Print / save PDF
          </Button>
        }
      />

      <div className="flex flex-wrap gap-2 print:hidden">
        {RANGES.map((r) => (
          <button
            key={r.id}
            onClick={() => setRange(r.id)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              range === r.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <Panel title={`Report for ${data.profile.name}`}>
        <p className="text-sm text-muted-foreground">
          Period: {format(cutoff, "MMM d, yyyy")} – {format(new Date(), "MMM d, yyyy")}
        </p>

        <h3 className="mt-6 font-display text-base font-semibold">Conditions</h3>
        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
          {data.conditions.map((c) => (
            <li key={c.id}>
              {c.name} — {c.status}
            </li>
          ))}
        </ul>

        <h3 className="mt-6 font-display text-base font-semibold">Current medications</h3>
        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
          {data.medications.map((m) => (
            <li key={m.id}>
              {m.name} {m.dose}
              {m.unit} — {frequencyLabel(m.frequency)} ({m.times.join(", ")})
            </li>
          ))}
        </ul>
        <p className="mt-2 text-sm text-muted-foreground">Doses recorded in period: {adherence}%</p>

        <h3 className="mt-6 font-display text-base font-semibold">Measurements ({measurements.length})</h3>
        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
          {measurements.slice(0, 25).map((m) => (
            <li key={m.id}>
              {format(new Date(m.takenAt), "MMM d, HH:mm")} — {m.label}:{" "}
              {m.kind === "blood_pressure" ? `${m.value}/${m.secondaryValue}` : m.value} {m.unit}
              {m.context ? ` (${m.context})` : ""}
            </li>
          ))}
        </ul>

        <h3 className="mt-6 font-display text-base font-semibold">Symptoms ({symptoms.length})</h3>
        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
          {symptoms.map((s) => (
            <li key={s.id}>
              {format(new Date(s.occurredAt), "MMM d")} — {s.name}, severity {s.severity}/5
            </li>
          ))}
        </ul>
      </Panel>

      <SafetyNote>
        This report reproduces what you recorded. It is not a clinical document and contains no interpretation.
      </SafetyNote>
    </div>
  );
}
