import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { format, isSameDay } from "date-fns";
import { Check, Pencil, Pill, Plus, SkipForward, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState, PageHeader, Panel, SafetyNote, StatusPill } from "@/components/vitavyn/primitives";
import { DoseScheduleField, slotLabel, sortSchedule } from "@/components/vitavyn/DoseScheduleField";
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
  prescriber: string;
  notes: string;
  schedule: DoseSlot[];
};

const emptyForm: MedForm = {
  name: "",
  dose: "",
  unit: "mg",
  form: "tablet",
  prescriber: "",
  notes: "",
  schedule: [{ slot: "morning", time: "08:00" }],
};

function MedicationsPage() {
  const { data, add, remove, updateItem } = useVitavyn();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<MedForm>(emptyForm);

  const today = new Date();
  const todaysLogs = data.medicationLogs.filter((log) => isSameDay(new Date(log.scheduledFor), today));

  const schedule = data.medications
    .flatMap((med) =>
      medicationSchedule(med).map(({ slot, time }) => {
        const log = todaysLogs.find(
          (l) => l.medicationId === med.id && format(new Date(l.scheduledFor), "HH:mm") === time,
        );
        return { med, slot, time, log };
      }),
    )
    .sort((a, b) => a.time.localeCompare(b.time));

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
    toast.success(status === "recorded" ? "Dose recorded" : "Dose marked as skipped");
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
      form: med.form,
      prescriber: med.prescriber ?? "",
      notes: med.notes ?? "",
      schedule: medicationSchedule(med),
    });
    setOpen(true);
  };

  const saveMedication = () => {
    if (!form.name.trim()) {
      toast.error("Medication name is required");
      return;
    }
    if (form.schedule.length === 0) {
      toast.error("Pick at least one time of day");
      return;
    }
    const payload = {
      name: form.name.trim(),
      dose: form.dose,
      unit: form.unit,
      form: form.form,
      frequency:
        form.schedule.length === 1 ? "Once daily" : `${form.schedule.length} times daily`,
      schedule: sortSchedule(form.schedule),
      times: sortSchedule(form.schedule).map((s) => s.time),
      prescriber: form.prescriber,
      notes: form.notes,
    };

    if (editingId) {
      updateItem("medications", editingId, payload as never);
      toast.success("Medication updated");
    } else {
      add("medications", {
        ...payload,
        conditionIds: [],
        startDate: new Date().toISOString(),
        endDate: null,
        refillReminder: true,
      } as never);
      toast.success("Medication added");
    }
    setOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const takenCount = todaysLogs.filter((l) => l.status === "recorded").length;

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
            {schedule.map(({ med, slot, time, log }) => (
              <li key={med.id + time} className="flex items-center justify-between gap-3 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-20">
                    <p className="metric-value text-sm">{time}</p>
                    <p className="text-xs text-muted-foreground">{slotLabel(slot)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{med.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {med.dose} {med.unit} · {med.form}
                    </p>
                  </div>
                </div>
                {log ? (
                  <StatusPill tone={log.status === "recorded" ? "success" : "neutral"}>
                    {log.status === "recorded" ? "Recorded" : "Skipped"}
                  </StatusPill>
                ) : (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => markDose(med.id, time, "recorded")}>
                      <Check className="h-4 w-4" /> Record
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => markDose(med.id, time, "skipped")}>
                      <SkipForward className="h-4 w-4" /> Skip
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="All medications">
        {data.medications.length === 0 ? (
          <EmptyState title="No medications yet" description="Anything you add appears here with its schedule." />
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {data.medications.map((med) => (
              <li key={med.id} className="rounded-xl border border-border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <Pill className="mt-0.5 h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{med.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {med.dose} {med.unit} · {describeSchedule(medicationSchedule(med))}
                      </p>
                      {med.prescriber ? (
                        <p className="mt-1 text-xs text-muted-foreground">Prescribed by {med.prescriber}</p>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Edit ${med.name}`}
                      onClick={() => openEdit(med)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Remove ${med.name}`}
                      onClick={() => remove("medications", med.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <SafetyNote>
        Vitavyn is a personal record, not a pharmacist. Always confirm dosage changes with your prescriber.
      </SafetyNote>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit medication" : "Add medication"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Dose</Label>
              <Input value={form.dose} onChange={(e) => setForm({ ...form, dose: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Unit</Label>
              <Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Form</Label>
              <Input value={form.form} onChange={(e) => setForm({ ...form, form: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Prescriber</Label>
              <Input
                value={form.prescriber}
                onChange={(e) => setForm({ ...form, prescriber: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <DoseScheduleField
                schedule={form.schedule}
                onChange={(next) => setForm({ ...form, schedule: next })}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={saveMedication}>
              {editingId ? "Save changes" : "Save medication"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
