import { useState } from "react";
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
import { glucoseToMgdl, glucoseToMmol, round } from "@/lib/vitavyn/units";

const ENTRY_TYPES = [
  { id: "glucose", label: "Log glucose" },
  { id: "blood_pressure", label: "Blood pressure" },
  { id: "weight", label: "Weight" },
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
  panel?: string;
  analyte?: string;
  dueDate?: string;
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
  const [type, setType] = useState<EntryType | null>(initialType ?? null);
  const [form, setForm] = useState<FormState>({});

  const set = (key: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));
  const close = () => {
    setForm({});
    setType(null);
    onOpenChange(false);
  };

  const nowIso = () => new Date().toISOString();

  const save = () => {
    switch (type) {
      case "glucose": {
        const raw = Number(form.value);
        if (!raw) {
          toast.error("Enter a glucose value");
          return;
        }
        const unit = (form.unit ?? data.preferences.glucoseUnit) as "mg/dL" | "mmol/L";
        const mgdl = unit === "mg/dL" ? raw : glucoseToMgdl(raw);
        add("measurements", {
          kind: "glucose",
          label: "Blood glucose",
          value: round(mgdl, 0),
          unit: "mg/dL",
          context: form.context ?? "Other",
          conditionId: data.conditions.find((c) => c.name.includes("Diabetes"))?.id ?? null,
          takenAt: nowIso(),
          notes: form.notes,
        } as never);
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
        if (!form.value) {
          toast.error("Enter a weight");
          return;
        }
        add("measurements", {
          kind: "weight",
          label: "Weight",
          value: Number(form.value),
          unit: data.preferences.weightUnit,
          takenAt: nowIso(),
        } as never);
        break;
      }
      case "medication": {
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
                onClick={() => setType(entry.id)}
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
                {field(
                  "Value",
                  <Input
                    type="number"
                    inputMode="decimal"
                    value={form.value ?? ""}
                    onChange={(e) => set("value", e.target.value)}
                    className="metric-value h-16 text-3xl"
                  />,
                )}
                {field(
                  "Unit",
                  <Select
                    value={form.unit ?? data.preferences.glucoseUnit}
                    onValueChange={(v) => set("unit", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mg/dL">mg/dL</SelectItem>
                      <SelectItem value="mmol/L">mmol/L</SelectItem>
                    </SelectContent>
                  </Select>,
                )}
                <p className="text-sm text-muted-foreground">
                  {form.value
                    ? (form.unit ?? data.preferences.glucoseUnit) === "mg/dL"
                      ? `≈ ${round(glucoseToMmol(Number(form.value)), 1)} mmol/L`
                      : `≈ ${round(glucoseToMgdl(Number(form.value)), 0)} mg/dL`
                    : "Conversion appears as you type."}
                </p>
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
                  "Systolic",
                  <Input
                    type="number"
                    value={form.systolic ?? ""}
                    onChange={(e) => set("systolic", e.target.value)}
                    className="metric-value h-14 text-2xl"
                  />,
                )}
                {field(
                  "Diastolic",
                  <Input
                    type="number"
                    value={form.diastolic ?? ""}
                    onChange={(e) => set("diastolic", e.target.value)}
                    className="metric-value h-14 text-2xl"
                  />,
                )}
              </div>
            )}

            {type === "weight" &&
              field(
                `Weight (${data.preferences.weightUnit})`,
                <Input
                  type="number"
                  value={form.value ?? ""}
                  onChange={(e) => set("value", e.target.value)}
                  className="metric-value h-14 text-2xl"
                />,
              )}

            {type === "medication" &&
              field(
                "Medication",
                <Select value={form.medicationId ?? ""} onValueChange={(v) => set("medicationId", v)}>
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
                  "Location",
                  <Input value={form.location ?? ""} onChange={(e) => set("location", e.target.value)} />,
                )}
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

            {type !== "glucose" && type !== "note" && type !== "appointment" && type !== "lab"
              ? field(
                  "Notes",
                  <Textarea value={form.notes ?? ""} onChange={(e) => set("notes", e.target.value)} />,
                )
              : null}

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
