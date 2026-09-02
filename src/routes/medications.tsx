import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { format, isSameDay } from "date-fns";
import { Check, Pencil, Pill, Plus, SkipForward, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState, PageHeader, Panel, SafetyNote, StatusPill } from "@/components/vitavyn/primitives";
import { DoseScheduleField, slotLabel, sortSchedule } from "@/components/vitavyn/DoseScheduleField";
import {
  FREQUENCIES,
  MED_FORMS,
  frequencyLabel,
  genericFor,
  isPastMedication,
  medFormIcon,
  medFormLabel,
  mealContextLabel,
  unitsForForm,
} from "@/lib/vitavyn/medication";
import { useVitavyn } from "@/lib/vitavyn/store";
import type { DoseSlot, Medication, SlotId } from "@/lib/vitavyn/types";

export const Route = createFileRoute("/medications")({
  head: () => ({
    meta: [
      { title: "Medications — Vitavyn" },
      {
        name: "description",
        content: "Medication list, daily schedule, adherence history and refill reminders in one calm view.",
      },
      { property: "og:title", content: "Medications — Vitavyn" },
      { property: "og:description", content: "Schedules, adherence and refills without the clutter." },
    ],
  }),
  component: MedicationsPage,
});

function inferSlot(time: string): SlotId {
  const hour = Number(time.split(":")[0] ?? 8);
  if (hour < 11) return "morning";
  if (hour < 16) return "noon";
  if (hour < 21) return "evening";
  return "night";
}

export function medicationSchedule(med: Medication): DoseSlot[] {
  if (med.schedule?.length) return sortSchedule(med.schedule);
  return sortSchedule((med.times ?? []).map((time) => ({ slot: inferSlot(time), time })));
}

function describeSchedule(schedule: DoseSlot[]) {
  return schedule.map((s) => `${slotLabel(s.slot)} ${s.time}`).join(" · ") || "No times set";
}

type MedForm = {
  name: string;
  dose: string;
  unit: string;
  form: string;
  frequency: string;
  conditionId: string;
  prescriber: string;
  startDate: string;
  endDate: string;
  notes: string;
  schedule: DoseSlot[];
};

const emptyForm: MedForm = {
  name: "",
  dose: "",
  unit: "mg",
  form: "tablet",
  frequency: "every_day",
  conditionId: "none",
  prescriber: "none",
  startDate: "",
  endDate: "",
  notes: "",
  schedule: [{ slot: "morning", time: "08:00", mealContext: "anytime" }],
};

function MedicationsPage() {
  const { data, add, remove, updateItem } = useVitavyn();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Medication | null>(null);
  const [form, setForm] = useState<MedForm>(emptyForm);

  const today = new Date();
  const todaysLogs = data.medicationLogs.filter((log) => isSameDay(new Date(log.scheduledFor), today));

  const current = useMemo(
    () => data.medications.filter((m) => !isPastMedication(m)),
    [data.medications],
  );
  const past = useMemo(() => data.medications.filter((m) => isPastMedication(m)), [data.medications]);

  const schedule = current
    .flatMap((med) =>
      medicationSchedule(med).map((dose) => {
        const log = todaysLogs.find(
          (l) => l.medicationId === med.id && format(new Date(l.scheduledFor), "HH:mm") === dose.time,
        );
        return { med, dose, log };
      }),
    )
    .sort((a, b) => a.dose.time.localeCompare(b.dose.time));

  const markDose = (medicationId: string, time: string, status: "recorded" | "skipped") => {
    const [h, m] = time.split(":");
    const scheduled = new Date();
    scheduled.setHours(Number(h), Number(m), 0, 0);
    add("medicationLogs", {
      medicationId,
      scheduledFor: scheduled.toISOString(),
      recordedAt: new Date().toISOString(),
      status,
    } as never);
    toast.success(status === "recorded" ? "Dose recorded" : "Marked as not taken");
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (med: Medication) => {
    setEditingId(med.id);
    setForm({
      name: med.name,
      dose: med.dose,
      unit: med.unit,
      form: MED_FORMS.some((f) => f.value === med.form) ? med.form : "tablet",
      frequency: FREQUENCIES.some((f) => f.value === med.frequency) ? med.frequency : "every_day",
      conditionId: med.conditionIds?.[0] ?? "none",
      prescriber: med.prescriber || "none",
      startDate: med.startDate ? med.startDate.slice(0, 10) : "",
      endDate: med.endDate ? med.endDate.slice(0, 10) : "",
      notes: med.notes ?? "",
      schedule: medicationSchedule(med),
    });
    setOpen(true);
  };

  const setFormKind = (value: string) => {
    const units = unitsForForm(value);
    setForm((prev) => ({
      ...prev,
      form: value,
      unit: units.includes(prev.unit) ? prev.unit : units[0]!,
    }));
  };

  const saveMedication = () => {
    if (!form.name.trim()) {
      toast.error("Medication name is required");
      return;
    }
    if (form.schedule.length === 0 && form.frequency !== "as_needed") {
      toast.error("Pick at least one time of day");
      return;
    }
    const ordered = sortSchedule(form.schedule);
    const payload = {
      name: form.name.trim(),
      dose: form.dose,
      unit: form.unit,
      form: form.form,
      frequency: form.frequency,
      schedule: ordered,
      times: ordered.map((s) => s.time),
      conditionIds: form.conditionId === "none" ? [] : [form.conditionId],
      prescriber: form.prescriber === "none" ? "" : form.prescriber,
      startDate: form.startDate ? new Date(form.startDate).toISOString() : undefined,
      endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
      notes: form.notes,
    };

    if (editingId) {
      updateItem("medications", editingId, payload as never);
      toast.success("Medication updated");
    } else {
      add("medications", {
        ...payload,
        startDate: payload.startDate ?? new Date().toISOString(),
        refillReminder: true,
      } as never);
      toast.success("Medication added");
    }
    setOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    const id = pendingDelete.id;
    remove("medications", id);
    data.medicationLogs
      .filter((l) => l.medicationId === id)
      .forEach((l) => remove("medicationLogs", l.id));
    setPendingDelete(null);
    toast.success("Medication deleted");
  };

  const takenCount = todaysLogs.filter((l) => l.status === "recorded").length;
  const generic = genericFor(form.name);
  const unitOptions = unitsForForm(form.form);

  const MedCard = ({ med, archived }: { med: Medication; archived?: boolean }) => {
    const Icon = medFormIcon(med.form);
    return (
      <li className={`rounded-xl border border-border p-4 ${archived ? "opacity-60" : ""}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <Icon className="mt-0.5 h-5 w-5 text-primary" strokeWidth={1.75} />
            <div>
              <p className="font-medium">{med.name}</p>
              <p className="text-xs text-muted-foreground">
                {med.dose} {med.unit} · {medFormLabel(med.form)} · {frequencyLabel(med.frequency)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {describeSchedule(medicationSchedule(med))}
              </p>
              {med.prescriber ? (
                <p className="mt-1 text-xs text-muted-foreground">Prescribed by {med.prescriber}</p>
              ) : null}
              {archived && med.endDate ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  Ended {format(new Date(med.endDate), "d MMM yyyy")}
                </p>
              ) : null}
            </div>
          </div>
          <div className="flex shrink-0">
            <Button variant="ghost" size="icon" aria-label={`Edit ${med.name}`} onClick={() => openEdit(med)}>
              <Pencil className="h-4 w-4" strokeWidth={1.75} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Delete ${med.name}`}
              onClick={() => setPendingDelete(med)}
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.75} />
            </Button>
          </div>
        </div>
      </li>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Medications"
        description="Vitavyn tracks what you record. It never suggests changing a dose."
        actions={
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4" /> Add medication
          </Button>
        }
      />

      <Panel
        title="Today's schedule"
        action={
          <span className="text-sm text-muted-foreground">
            {takenCount} of {schedule.length} recorded
          </span>
        }
      >
        {schedule.length === 0 ? (
          <EmptyState title="No doses scheduled" description="Add a medication and choose morning, noon, evening or night." />
        ) : (
          <ul className="divide-y divide-border">
            {schedule.map(({ med, dose, log }) => (
              <li key={med.id + dose.time} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-20">
                    <p className="metric-value text-sm">{dose.time}</p>
                    <p className="text-xs text-muted-foreground">{slotLabel(dose.slot)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{med.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {med.dose} {med.unit} · {mealContextLabel(dose.mealContext)}
                    </p>
                  </div>
                </div>
                {log ? (
                  <StatusPill tone={log.status === "recorded" ? "success" : "neutral"}>
                    {log.status === "recorded" ? "Recorded" : "Not taken"}
                  </StatusPill>
                ) : (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => markDose(med.id, dose.time, "recorded")}>
                      <Check className="h-4 w-4" /> Record
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => markDose(med.id, dose.time, "skipped")}>
                      <SkipForward className="h-4 w-4" /> Not taken
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Current medications">
        {current.length === 0 ? (
          <EmptyState title="No current medications" description="Anything you add appears here with its schedule." />
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {current.map((med) => (
              <MedCard key={med.id} med={med} />
            ))}
          </ul>
        )}
      </Panel>

      {past.length > 0 ? (
        <Panel title="Past medications" action={<span className="text-sm text-muted-foreground">Kept for your history</span>}>
          <ul className="grid gap-3 md:grid-cols-2">
            {past.map((med) => (
              <MedCard key={med.id} med={med} archived />
            ))}
          </ul>
        </Panel>
      ) : null}

      <SafetyNote>
        Vitavyn is a personal record, not a pharmacist. Always confirm dosage changes with your prescriber.
      </SafetyNote>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit medication" : "Add medication"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Medication name</Label>
              <div className="flex items-center gap-2">
                <Pill className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
                <Input
                  value={form.name}
                  placeholder="e.g. Metformin"
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              {generic ? (
                <p className="text-xs text-muted-foreground">Generic equivalent: {generic}</p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label>Dose</Label>
              <Input
                value={form.dose}
                placeholder="e.g. 5/1000"
                onChange={(e) => setForm({ ...form, dose: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Unit</Label>
              <Select
                value={form.unit}
                onValueChange={(v) => setForm({ ...form, unit: v })}
                disabled={unitOptions.length === 1}
              >
                <SelectTrigger aria-label="Unit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {unitOptions.map((u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Form</Label>
              <Select value={form.form} onValueChange={setFormKind}>
                <SelectTrigger aria-label="Form">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MED_FORMS.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      <span className="flex items-center gap-2">
                        <f.icon className="h-4 w-4" strokeWidth={1.75} />
                        {f.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Frequency</Label>
              <Select value={form.frequency} onValueChange={(v) => setForm({ ...form, frequency: v })}>
                <SelectTrigger aria-label="Frequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FREQUENCIES.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label>Related condition</Label>
              <Select value={form.conditionId} onValueChange={(v) => setForm({ ...form, conditionId: v })}>
                <SelectTrigger aria-label="Related condition">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {data.conditions.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="sm:col-span-2">
              <DoseScheduleField
                schedule={form.schedule}
                onChange={(next) => setForm({ ...form, schedule: next })}
              />
            </div>

            <div className="sm:col-span-2">
              <Accordion type="single" collapsible>
                <AccordionItem value="more" className="border-b-0">
                  <AccordionTrigger className="text-sm">More details</AccordionTrigger>
                  <AccordionContent>
                    <div className="grid gap-4 pt-1 sm:grid-cols-2">
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label>Prescriber</Label>
                        <Select
                          value={form.prescriber}
                          onValueChange={(v) => setForm({ ...form, prescriber: v })}
                        >
                          <SelectTrigger aria-label="Prescriber">
                            <SelectValue placeholder="None" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {data.providers.map((p) => (
                              <SelectItem key={p.id} value={p.name}>
                                {p.name} · {p.specialty}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label>Start date</Label>
                        <Input
                          type="date"
                          value={form.startDate}
                          onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>End date</Label>
                        <Input
                          type="date"
                          value={form.endDate}
                          onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label>Notes</Label>
                        <Textarea
                          value={form.notes}
                          onChange={(e) => setForm({ ...form, notes: e.target.value })}
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={saveMedication}>{editingId ? "Save changes" : "Save medication"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permanently delete this medication?</AlertDialogTitle>
            <AlertDialogDescription>
              This will erase all associated logs and history from your records. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
