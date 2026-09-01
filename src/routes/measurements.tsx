import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { format } from "date-fns";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState, PageHeader, Panel } from "@/components/vitavyn/primitives";
import { MeasurementChart } from "@/components/vitavyn/MeasurementChart";
import { QuickAdd } from "@/components/vitavyn/QuickAdd";
import { UnitValueInput } from "@/components/vitavyn/UnitValueInput";
import { useVitavyn } from "@/lib/vitavyn/store";
import type { Measurement } from "@/lib/vitavyn/types";
import {
  canonicalUnit,
  formatMeasurement,
  fromCanonicalValue,
  preferredUnit,
  round,
  toCanonicalValue,
} from "@/lib/vitavyn/units";

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
  const { data, remove, updateItem } = useVitavyn();
  const prefs = data.preferences;
  const [kind, setKind] = useState("glucose");
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<Measurement | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editSecondary, setEditSecondary] = useState("");
  const [editUnit, setEditUnit] = useState("");

  const rows = data.measurements
    .filter((m) => m.kind === kind)
    .sort((a, b) => new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime());

  const openEdit = (row: Measurement) => {
    const unit = preferredUnit(row.kind, prefs, row.unit);
    setEditing(row);
    setEditUnit(unit);
    setEditValue(String(round(fromCanonicalValue(row.kind, unit, row.value), 2)));
    setEditSecondary(row.secondaryValue != null ? String(row.secondaryValue) : "");
  };

  const saveEdit = () => {
    if (!editing) return;
    const raw = Number(editValue);
    if (!Number.isFinite(raw)) {
      toast.error("Enter a valid value");
      return;
    }
    updateItem("measurements", editing.id, {
      value: round(toCanonicalValue(editing.kind, editUnit, raw), 2),
      unit: canonicalUnit(editing.kind) || editUnit,
      secondaryValue: editSecondary === "" ? null : Number(editSecondary),
    } as never);
    setEditing(null);
    toast.success("Measurement updated");
  };

  const display = (row: Measurement) =>
    row.kind === "blood_pressure"
      ? `${row.value} / ${row.secondaryValue} ${row.unit}`
      : formatMeasurement(row.kind, row.unit, row.value, prefs);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Measurements"
        description="Nothing here is hardcoded to one disease — add any measurement type you need, in any unit."
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
              <li key={row.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <div>
                  <p className="font-medium">{display(row)}</p>
                  <p className="text-xs text-muted-foreground">{row.context ?? row.label}</p>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(row.takenAt), "MMM d, yyyy · HH:mm")}
                  </span>
                  <Button variant="ghost" size="icon" aria-label="Edit measurement" onClick={() => openEdit(row)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Delete measurement"
                    onClick={() => remove("measurements", row.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <QuickAdd open={addOpen} onOpenChange={setAddOpen} />

      <Dialog open={!!editing} onOpenChange={(next) => (next ? null : setEditing(null))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {editing?.label.toLowerCase()}</DialogTitle>
          </DialogHeader>
          {editing ? (
            editing.kind === "blood_pressure" ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Systolic</Label>
                  <Input type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Diastolic</Label>
                  <Input
                    type="number"
                    value={editSecondary}
                    onChange={(e) => setEditSecondary(e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <UnitValueInput
                kind={editing.kind}
                label={editing.label}
                value={editValue}
                unit={editUnit}
                onValueChange={setEditValue}
                onUnitChange={(u) => setEditUnit(u)}
              />
            )
          ) : null}
          <DialogFooter>
            <Button onClick={saveEdit}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
