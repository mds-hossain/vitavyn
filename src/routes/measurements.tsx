import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState, PageHeader, Panel } from "@/components/vitavyn/primitives";
import { kindForMetric } from "@/lib/vitavyn/conditionSeed";
import { MeasurementChart } from "@/components/vitavyn/MeasurementChart";
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
  validateSearch: (search: Record<string, unknown>) => ({
    condition: typeof search["condition"] === "string" ? (search["condition"] as string) : "",
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
  const { data, add, remove, updateItem, hydrated } = useVitavyn();
  const { condition: initialCondition } = Route.useSearch();
  const prefs = data.preferences;
  const [conditionId, setConditionId] = useState(initialCondition || "all");
  const [kind, setKind] = useState("glucose");
  const [addOpen, setAddOpen] = useState(false);
  const [logValue, setLogValue] = useState("");
  const [logSecondary, setLogSecondary] = useState("");
  const [logUnit, setLogUnit] = useState("");
  const [logLabel, setLogLabel] = useState("");
  const [editing, setEditing] = useState<Measurement | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editSecondary, setEditSecondary] = useState("");
  const [editUnit, setEditUnit] = useState("");

  useEffect(() => {
    if (initialCondition) setConditionId(initialCondition);
  }, [initialCondition]);

  const activeCondition =
    conditionId === "all" ? undefined : data.conditions.find((c) => c.id === conditionId);

  /** Kind chips follow the selected condition's tracked metrics. */
  const visibleKinds = useMemo(() => {
    if (!activeCondition) return KINDS;
    const allowed = new Set(
      activeCondition.trackedMetrics
        .map((metric) => kindForMetric(metric))
        .filter((k): k is string => !!k),
    );
    if (activeCondition.trackedMetrics.some((metric) => !kindForMetric(metric))) allowed.add("custom");
    const list = KINDS.filter((k) => allowed.has(k.id));
    return list.length > 0 ? list : KINDS;
  }, [activeCondition]);

  useEffect(() => {
    if (!visibleKinds.some((k) => k.id === kind)) setKind(visibleKinds[0]?.id ?? "glucose");
  }, [visibleKinds, kind]);

  const rows = data.measurements
    .filter((m) => m.kind === kind)
    .filter((m) => !activeCondition || !m.conditionId || m.conditionId === activeCondition.id)
    .sort((a, b) => new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime());

  const activeKindLabel = KINDS.find((k) => k.id === kind)?.label ?? "Measurement";

  const openLog = () => {
    setLogValue("");
    setLogSecondary("");
    setLogLabel("");
    setLogUnit(preferredUnit(kind, prefs));
    setAddOpen(true);
  };

  const saveLog = () => {
    const label = kind === "custom" ? logLabel.trim() : activeKindLabel;
    if (kind === "custom" && !label) {
      toast.error("Name this measurement");
      return;
    }
    if (kind === "blood_pressure") {
      const sys = Number(logValue);
      const dia = Number(logSecondary);
      if (!Number.isFinite(sys) || !Number.isFinite(dia) || !logValue || !logSecondary) {
        toast.error("Enter both values");
        return;
      }
      add("measurements", {
        kind,
        label,
        value: sys,
        secondaryValue: dia,
        unit: "mmHg",
        takenAt: new Date().toISOString(),
        conditionId: activeCondition?.id ?? null,
      } as never);
    } else {
      const raw = Number(logValue);
      if (!logValue || !Number.isFinite(raw)) {
        toast.error("Enter a valid value");
        return;
      }
      add("measurements", {
        kind,
        label,
        value: round(toCanonicalValue(kind, logUnit, raw), 2),
        unit: canonicalUnit(kind) || logUnit,
        takenAt: new Date().toISOString(),
        conditionId: activeCondition?.id ?? null,
      } as never);
    }
    setAddOpen(false);
    toast.success(`${label} logged`);
  };

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
      {activeCondition ? (
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link to="/conditions/$conditionId" params={{ conditionId: activeCondition.id }}>
            <ArrowLeft className="h-4 w-4" /> {activeCondition.name}
          </Link>
        </Button>
      ) : null}
      <PageHeader
        title="Measurements"
        description="Nothing here is hardcoded to one disease — add any measurement type you need, in any unit."
        actions={
          <Button onClick={openLog}>
            <Plus className="h-4 w-4" /> Log {activeKindLabel.toLowerCase()}
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <Select value={conditionId} onValueChange={setConditionId}>
          <SelectTrigger className="w-full sm:w-64" aria-label="Filter by condition">
            <SelectValue placeholder="All conditions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All conditions</SelectItem>
            {data.conditions.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {activeCondition ? (
          <p className="text-xs text-muted-foreground">
            Showing metrics tracked for {activeCondition.name}.
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        {visibleKinds.map((k) => (
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
                    {hydrated ? format(new Date(row.takenAt), "MMM d, yyyy · HH:mm") : ""}
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

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log {activeKindLabel.toLowerCase()}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {kind === "custom" ? (
              <div className="space-y-1.5">
                <Label>Measurement name</Label>
                <Input
                  value={logLabel}
                  onChange={(e) => setLogLabel(e.target.value)}
                  placeholder="e.g. Peak flow"
                />
              </div>
            ) : null}
            {kind === "blood_pressure" ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Systolic</Label>
                  <Input type="number" value={logValue} onChange={(e) => setLogValue(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Diastolic</Label>
                  <Input
                    type="number"
                    value={logSecondary}
                    onChange={(e) => setLogSecondary(e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <UnitValueInput
                kind={kind}
                label={kind === "custom" ? "Value" : activeKindLabel}
                big
                value={logValue}
                unit={logUnit}
                onValueChange={setLogValue}
                onUnitChange={setLogUnit}
              />
            )}
            {activeCondition ? (
              <p className="text-xs text-muted-foreground">
                Linked to {activeCondition.name}.
              </p>
            ) : null}
          </div>
          <DialogFooter>
            <Button onClick={saveLog}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
