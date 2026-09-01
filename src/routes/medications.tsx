import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { format, isSameDay } from "date-fns";
import { Check, Pill, Plus, SkipForward, Trash2 } from "lucide-react";
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
import { useVitavyn } from "@/lib/vitavyn/store";

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

function MedicationsPage() {
  const { data, add, remove } = useVitavyn();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    dose: "",
    unit: "mg",
    form: "tablet",
    frequency: "Once daily",
    times: "08:00",
    prescriber: "",
    notes: "",
  });

  const today = new Date();
  const todaysLogs = data.medicationLogs.filter((log) => isSameDay(new Date(log.scheduledFor), today));

  const schedule = data.medications.flatMap((med) =>
    med.times.map((time) => {
      const log = todaysLogs.find(
        (l) => l.medicationId === med.id && format(new Date(l.scheduledFor), "HH:mm") === time,
      );
      return { med, time, log };
    }),
  ).sort((a, b) => a.time.localeCompare(b.time));

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

  const saveMedication = () => {
    if (!form.name.trim()) {
      toast.error("Medication name is required");
      return;
    }
    add("medications", {
      name: form.name.trim(),
      dose: form.dose,
      unit: form.unit,
      form: form.form,
      frequency: form.frequency,
      times: form.times.split(",").map((t) => t.trim()).filter(Boolean),
      conditionIds: [],
      prescriber: form.prescriber,
      notes: form.notes,
      startDate: new Date().toISOString(),
      endDate: null,
      refillReminder: true,
    } as never);
    setOpen(false);
    setForm({ ...form, name: "", dose: "", prescriber: "", notes: "" });
    toast.success("Medication added");
  };

  const takenCount = todaysLogs.filter((l) => l.status === "recorded").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Medications"
        description="Vitavyn tracks what you record. It never suggests changing a dose."
        actions={
          <Button onClick={() => setOpen(true)}>
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
          <EmptyState title="No doses scheduled" description="Add a medication with times to build your daily schedule." />
        ) : (
          <ul className="divide-y divide-border">
            {schedule.map(({ med, time, log }) => (
              <li key={med.id + time} className="flex items-center justify-between gap-3 py-3">
                <div className="flex items-center gap-3">
                  <span className="metric-value w-14 text-sm text-muted-foreground">{time}</span>
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
                        {med.dose} {med.unit} · {med.frequency} · {med.times.join(", ")}
                      </p>
                      {med.prescriber ? (
                        <p className="mt-1 text-xs text-muted-foreground">Prescribed by {med.prescriber}</p>
                      ) : null}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Remove ${med.name}`}
                    onClick={() => remove("medications", med.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add medication</DialogTitle>
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
              <Label>Frequency</Label>
              <Input value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Times (comma separated)</Label>
              <Input value={form.times} onChange={(e) => setForm({ ...form, times: e.target.value })} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={saveMedication}>Save medication</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
