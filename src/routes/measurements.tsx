import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, PageHeader, Panel } from "@/components/vitavyn/primitives";
import { MeasurementChart } from "@/components/vitavyn/MeasurementChart";
import { QuickAdd } from "@/components/vitavyn/QuickAdd";
import { useVitavyn } from "@/lib/vitavyn/store";

export const Route = createFileRoute("/measurements")({
  head: () => ({
    meta: [
      { title: "Measurements — Vitavyn" },
      {
        name: "description",
        content:
          "A universal measurement engine: glucose, blood pressure, weight, lipids, thyroid, kidney markers and custom values.",
      },
      { property: "og:title", content: "Measurements — Vitavyn" },
      { property: "og:description", content: "Every value you track, with trends and units you prefer." },
    ],
  }),
  component: MeasurementsPage,
});

const KINDS = [
  { id: "glucose", label: "Blood glucose" },
  { id: "blood_pressure", label: "Blood pressure" },
  { id: "weight", label: "Weight" },
  { id: "hba1c", label: "HbA1c" },
  { id: "heart_rate", label: "Heart rate" },
  { id: "temperature", label: "Temperature" },
  { id: "cholesterol", label: "Cholesterol" },
  { id: "custom", label: "Custom" },
];

function MeasurementsPage() {
  const { data } = useVitavyn();
  const [kind, setKind] = useState("glucose");
  const [addOpen, setAddOpen] = useState(false);

  const rows = data.measurements
    .filter((m) => m.kind === kind)
    .sort((a, b) => new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime());

  return (
    <div className="space-y-6">
      <PageHeader
        title="Measurements"
        description="Nothing here is hardcoded to one disease — add any measurement type you need."
        actions={
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" /> Log measurement
          </Button>
        }
      />

      <div className="flex flex-wrap gap-2">
        {KINDS.map((k) => (
          <button
            key={k.id}
            onClick={() => setKind(k.id)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              kind === k.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            {k.label}
          </button>
        ))}
      </div>

      <MeasurementChart measurements={rows} title="Trend" />

      <Panel title="History">
        {rows.length === 0 ? (
          <EmptyState
            title="Nothing recorded yet"
            description="Once you log this measurement it appears here with trends and history."
          />
        ) : (
          <ul className="divide-y divide-border">
            {rows.map((row) => (
              <li key={row.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p className="font-medium">
                    {row.kind === "blood_pressure"
                      ? `${row.value} / ${row.secondaryValue} ${row.unit}`
                      : `${row.value} ${row.unit}`}
                  </p>
                  <p className="text-xs text-muted-foreground">{row.context ?? row.label}</p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(row.takenAt), "MMM d, yyyy · HH:mm")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <QuickAdd open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}
