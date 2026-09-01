import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useVitavyn } from "@/lib/vitavyn/store";
import { round, toCanonicalValue, canonicalUnit } from "@/lib/vitavyn/units";
import { UnitValueInput } from "@/components/vitavyn/UnitValueInput";
import { AddressAutocomplete } from "@/components/vitavyn/AddressAutocomplete";
import { DoseScheduleField, sortSchedule } from "@/components/vitavyn/DoseScheduleField";
import type { DoseSlot } from "@/lib/vitavyn/types";

const ENTRY_TYPES = [
  { id: "glucose", label: "Log glucose" },
  { id: "blood_pressure", label: "Blood pressure" },
  { id: "weight", label: "Weight" },
  { id: "temperature", label: "Temperature" },
  { id: "medication", label: "Medication" },
  { id: "symptom", label: "Symptom" },
  { id: "meal", label: "Meal" },
  { id: "appointment", label: "Appointment" },
  { id: "lab", label: "Lab result" },
  { id: "note", label: "Note / task" },
] as const;

type EntryType = (typeof ENTRY_TYPES)[number]["id"];

type FormState = {
  value?: string;
  unit?: string;
  context?: string;
  notes?: string;
  systolic?: string;
  diastolic?: string;
  medicationId?: string;
  name?: string;
  severity?: string;
  mealType?: string;
  carbs?: string;
  calories?: string;
  title?: string;
  providerName?: string;
  specialty?: string;
  startsAt?: string;
  location?: string;
  website?: string;
  panel?: string;
  analyte?: string;
  dueDate?: string;
  dose?: string;
  doseUnit?: string;
  form?: string;
};

export function QuickAdd({
  open,
  onOpenChange,
  initialType,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialType?: EntryType;
}) {
  const { data, add, update } = useVitavyn();
  const prefs = data.preferences;
  const [type, setType] = useState<EntryType | null>(initialType ?? null);
  const [form, setForm] = useState<FormState>({});
  const [medMode, setMedMode] = useState<"record" | "new">(
    data.medications.length > 0 ? "record" : "new",
  );
  const [schedule, setSchedule] = useState<DoseSlot[]>([{ slot: "morning", time: "08:00" }]);

  useEffect(() => {
    if (open) setType(initialType ?? null);
  }, [open, initialType]);

  const set = (key: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const close = () => {
    setForm({});
    setType(null);
    setSchedule([{ slot: "morning", time: "08:00" }]);
    onOpenChange(false);
  };

  const pickType = (next: EntryType) => {
    setType(next);
    // Default the unit selector to the user's display preference,
    // but they can always switch it on the form.
    if (next === "glucose") set("unit", prefs.glucoseUnit);
    if (next === "weight") set("unit", prefs.weightUnit);
    if (next === "temperature") set("unit", prefs.tempUnit);
    if (next === "medication") setMedMode(data.medications.length > 0 ? "record" : "new");
  };

  const nowIso = () => new Date().toISOString();

  const saveMeasurement = (kind: string, label: string, extra: Record<string, unknown> = {}) => {
    const raw = Number(form.value);
    if (!form.value || !Number.isFinite(raw)) {
      toast.error(`Enter a ${label.toLowerCase()} value`);
      return false;
    }
    const unit = form.unit ?? canonicalUnit(kind);
    add("measurements", {
      kind,
      label,
      value: round(toCanonicalValue(kind, unit, raw), 2),
      unit: canonicalUnit(kind),
      takenAt: nowIso(),
      notes: form.notes,
      ...extra,
    } as never);
    return true;
  };

  const save = () => {
    switch (type) {
      case "glucose": {
        const ok = saveMeasurement("glucose", "Blood glucose", {
          context: form.context ?? "Other",
          conditionId: data.conditions.find((c) => c.name.includes("Diabetes"))?.id ?? null,
        });
        if (!ok) return;
        break;
      }
      case "blood_pressure": {
        if (!form.systolic || !form.diastolic) {
          toast.error("Enter both values");
          return;
        }
        add("measurements", {
          kind: "blood_pressure",
          label: "Blood pressure",
          value: Number(form.systolic),
          secondaryValue: Number(form.diastolic),
          unit: "mmHg",
          takenAt: nowIso(),
          notes: form.notes,
        } as never);
        break;
      }
      case "weight": {
        if (!saveMeasurement("weight", "Weight")) return;
        break;
      }
      case "temperature": {
        if (!saveMeasurement("temperature", "Temperature")) return;
        break;
      }
      case "medication": {
        if (medMode === "new") {
          if (!form.name?.trim()) {
            toast.error("Medication name is required");
            return;
          }
          if (schedule.length === 0) {
            toast.error("Pick at least one time of day");
            return;
          }
          const sorted = sortSchedule(schedule);
          add("medications", {
            name: form.name.trim(),
            dose: form.dose ?? "",
            unit: form.doseUnit ?? "mg",
            form: form.form ?? "tablet",
            frequency: sorted.length === 1 ? "Once daily" : `${sorted.length} times daily`,
            schedule: sorted,
            times: sorted.map((s) => s.time),
            conditionIds: [],
            startDate: nowIso(),
            endDate: null,
            refillReminder: true,
          } as never);
          break;
        }
        if (!form.medicationId) {
          toast.error("Choose a medication");
          return;
        }
        add("medicationLogs", {
          medicationId: form.medicationId,
          scheduledFor: nowIso(),
          recordedAt: nowIso(),
          status: "recorded",
        } as never);
        break;
      }
      case "symptom": {
        if (!form.name) {
          toast.error("Name the symptom");
          return;
        }
        add("symptoms", {
          name: form.name,
          severity: Number(form.severity ?? 3),
          occurredAt: nowIso(),
          notes: form.notes,
        } as never);
        break;
      }
      case "meal": {
        if (!form.name) {
          toast.error("Name the meal");
          return;
        }
        add("meals", {
          name: form.name,
          mealType: (form.mealType ?? "lunch") as "lunch",
          carbsGrams: form.carbs ? Number(form.carbs) : null,
          calories: form.calories ? Number(form.calories) : null,
          eatenAt: nowIso(),
        } as never);
        break;
      }
      case "appointment": {
        if (!form.title || !form.startsAt) {
          toast.error("Add a title and date");
          return;
        }
        add("appointments", {
          title: form.title,
          providerName: form.providerName ?? "",
          specialty: form.specialty ?? "",
          startsAt: new Date(form.startsAt).toISOString(),
          location: form.location,
          website: form.website,
          questions: [],
          status: "upcoming",
        } as never);
        break;
      }
      case "lab": {
        if (!form.analyte || !form.value) {
          toast.error("Add an analyte and value");
          return;
        }
        add("labResults", {
          panel: form.panel ?? "General",
          analyte: form.analyte,
          value: Number(form.value),
          unit: form.unit ?? "",
          collectedAt: nowIso(),
        } as never);
        break;
      }
      case "note": {
        if (!form.title) {
          toast.error("Write something first");
          return;
        }
        add("tasks", { title: form.title, dueDate: form.dueDate, done: false } as never);
        break;
      }
      default:
        return;
    }
    update((draft) => draft);
    toast.success("Saved to your local record");
    close();
  };

  const field = (label: string, node: React.ReactNode) => (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</Label>
      {node}
    </div>
  );

  return (
    <Sheet open={open} onOpenChange={(next) => (next ? onOpenChange(true) : close())}>
      <SheetContent side="bottom" className="max-h-[92vh] overflow-y-auto rounded-t-3xl sm:max-w-lg sm:mx-auto">
        <SheetHeader className="text-left">
          <SheetTitle>{type ? ENTRY_TYPES.find((t) => t.id === type)?.label : "Add entry"}</SheetTitle>
        </SheetHeader>

        {!type ? (
          <div className="grid gap-2 px-4 pb-8 sm:grid-cols-2">
            {ENTRY_TYPES.map((entry) => (
              <button
                key={entry.id}
                onClick={() => pickType(entry.id)}
                className="rounded-xl border border-border bg-surface px-4 py-4 text-left text-sm font-medium transition-colors hover:border-primary hover:bg-accent"
              >
                {entry.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-4 px-4 pb-8">
            {type === "glucose" && (
              <>
                <UnitValueInput
                  kind="glucose"
                  label="Blood glucose"
                  big
                  value={form.value ?? ""}
                  unit={form.unit ?? prefs.glucoseUnit}
                  onValueChange={(v) => set("value", v)}
                  onUnitChange={(u) => set("unit", u)}
                />
                {field(
                  "Context",
                  <Select value={form.context ?? "Fasting"} onValueChange={(v) => set("context", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["Fasting", "Before meal", "After meal", "Bedtime", "Other"].map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>,
                )}
              </>
            )}

            {type === "blood_pressure" && (
              <div className="grid grid-cols-2 gap-3">
                {field(
                  "Systolic (mmHg)",
                  <Input
                    type="number"
                    value={form.systolic ?? ""}
                    onChange={(e) => set("systolic", e.target.value)}
                    className="metric-value h-14 text-2xl"
                  />,
                )}
                {field(
                  "Diastolic (mmHg)",
                  <Input
                    type="number"
                    value={form.diastolic ?? ""}
                    onChange={(e) => set("diastolic", e.target.value)}
                    className="metric-value h-14 text-2xl"
                  />,
                )}
              </div>
            )}

            {type === "weight" && (
              <UnitValueInput
                kind="weight"
                label="Weight"
                big
                value={form.value ?? ""}
                unit={form.unit ?? prefs.weightUnit}
                onValueChange={(v) => set("value", v)}
                onUnitChange={(u) => set("unit", u)}
              />
            )}

            {type === "temperature" && (
              <UnitValueInput
                kind="temperature"
                label="Temperature"
                big
                value={form.value ?? ""}
                unit={form.unit ?? prefs.tempUnit}
                onValueChange={(v) => set("value", v)}
                onUnitChange={(u) => set("unit", u)}
              />
            )}

            {type === "medication" && (
              <>
                <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">
                  {(
                    [
                      ["record", "Record a dose"],
                      ["new", "Add new medication"],
                    ] as const
                  ).map(([mode, label]) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setMedMode(mode)}
                      className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        medMode === mode
                          ? "bg-surface text-foreground shadow-sm"
                          : "text-muted-foreground"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {medMode === "record" ? (
                  data.medications.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No medications yet — switch to “Add new medication” first.
                    </p>
                  ) : (
                    field(
                      "Medication",
                      <Select
                        value={form.medicationId ?? ""}
                        onValueChange={(v) => set("medicationId", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose medication" />
                        </SelectTrigger>
                        <SelectContent>
                          {data.medications.map((m) => (
                            <SelectItem key={m.id} value={m.id}>
                              {m.name} {m.dose}
                              {m.unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>,
                    )
                  )
                ) : (
                  <>
                    {field(
                      "Name",
                      <Input value={form.name ?? ""} onChange={(e) => set("name", e.target.value)} />,
                    )}
                    <div className="grid grid-cols-3 gap-3">
                      {field(
                        "Dose",
                        <Input value={form.dose ?? ""} onChange={(e) => set("dose", e.target.value)} />,
                      )}
                      {field(
                        "Unit",
                        <Input
                          value={form.doseUnit ?? "mg"}
                          onChange={(e) => set("doseUnit", e.target.value)}
                        />,
                      )}
                      {field(
                        "Form",
                        <Input
                          value={form.form ?? "tablet"}
                          onChange={(e) => set("form", e.target.value)}
                        />,
                      )}
                    </div>
                    <DoseScheduleField schedule={schedule} onChange={setSchedule} />
                  </>
                )}
              </>
            )}

            {type === "symptom" && (
              <>
                {field(
                  "Symptom",
                  <Input value={form.name ?? ""} onChange={(e) => set("name", e.target.value)} />,
                )}
                {field(
                  "Severity (1–5)",
                  <Select value={form.severity ?? "3"} onValueChange={(v) => set("severity", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>,
                )}
              </>
            )}

            {type === "meal" && (
              <>
                {field("Meal", <Input value={form.name ?? ""} onChange={(e) => set("name", e.target.value)} />)}
                {field(
                  "Type",
                  <Select value={form.mealType ?? "lunch"} onValueChange={(v) => set("mealType", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["breakfast", "lunch", "dinner", "snack"].map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>,
                )}
                <div className="grid grid-cols-2 gap-3">
                  {field(
                    "Carbs (g)",
                    <Input
                      type="number"
                      value={form.carbs ?? ""}
                      onChange={(e) => set("carbs", e.target.value)}
                    />,
                  )}
                  {field(
                    "Calories",
                    <Input
                      type="number"
                      value={form.calories ?? ""}
                      onChange={(e) => set("calories", e.target.value)}
                    />,
                  )}
                </div>
              </>
            )}

            {type === "appointment" && (
              <>
                {field("Title", <Input value={form.title ?? ""} onChange={(e) => set("title", e.target.value)} />)}
                {field(
                  "Doctor",
                  <Input
                    value={form.providerName ?? ""}
                    onChange={(e) => set("providerName", e.target.value)}
                  />,
                )}
                {field(
                  "Specialty",
                  <Input value={form.specialty ?? ""} onChange={(e) => set("specialty", e.target.value)} />,
                )}
                {field(
                  "Date & time",
                  <Input
                    type="datetime-local"
                    value={form.startsAt ?? ""}
                    onChange={(e) => set("startsAt", e.target.value)}
                  />,
                )}
                {field(
                  "Website",
                  <Input
                    placeholder="https://clinic.example"
                    value={form.website ?? ""}
                    onChange={(e) => set("website", e.target.value)}
                  />,
                )}
                <AddressAutocomplete
                  label="Location"
                  value={form.location ?? ""}
                  onChange={(v) => set("location", v)}
                />
              </>
            )}

            {type === "lab" && (
              <>
                {field("Panel", <Input value={form.panel ?? ""} onChange={(e) => set("panel", e.target.value)} />)}
                {field(
                  "Analyte",
                  <Input value={form.analyte ?? ""} onChange={(e) => set("analyte", e.target.value)} />,
                )}
                <div className="grid grid-cols-2 gap-3">
                  {field(
                    "Value",
                    <Input
                      type="number"
                      value={form.value ?? ""}
                      onChange={(e) => set("value", e.target.value)}
                    />,
                  )}
                  {field("Unit", <Input value={form.unit ?? ""} onChange={(e) => set("unit", e.target.value)} />)}
                </div>
              </>
            )}

            {type === "note" && (
              <>
                {field("Note", <Textarea value={form.title ?? ""} onChange={(e) => set("title", e.target.value)} />)}
                {field(
                  "Due date",
                  <Input
                    type="date"
                    value={form.dueDate ?? ""}
                    onChange={(e) => set("dueDate", e.target.value)}
                  />,
                )}
              </>
            )}

            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setType(null)}>
                Back
              </Button>
              <Button className="flex-1" onClick={save}>
                Save
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
