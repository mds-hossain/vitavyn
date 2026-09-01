import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { format } from "date-fns";
import { CalendarDays, Pencil, Plus } from "lucide-react";
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
import { EmptyState, PageHeader, Panel, StatusPill } from "@/components/vitavyn/primitives";
import { AddressAutocomplete } from "@/components/vitavyn/AddressAutocomplete";
import { useVitavyn } from "@/lib/vitavyn/store";
import type { Appointment } from "@/lib/vitavyn/types";

export const Route = createFileRoute("/appointments")({
  head: () => ({
    meta: [
      { title: "Appointments — Vitavyn" },
      {
        name: "description",
        content: "Upcoming visits, questions to ask, and notes captured after each appointment.",
      },
      { property: "og:title", content: "Appointments — Vitavyn" },
      { property: "og:description", content: "Prepare for visits and capture what was said." },
    ],
  }),
  component: AppointmentsPage,
});

const empty = {
  title: "Follow-up visit",
  providerName: "",
  specialty: "",
  startsAt: "",
  location: "",
  website: "",
};

const toLocalInput = (iso: string) => format(new Date(iso), "yyyy-MM-dd'T'HH:mm");

function AppointmentsPage() {
  const { data, add, updateItem } = useVitavyn();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(empty);

  const upcoming = data.appointments
    .filter((a) => a.status === "upcoming")
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
  const past = data.appointments.filter((a) => a.status !== "upcoming");

  const openAdd = () => {
    setEditingId(null);
    setForm(empty);
    setOpen(true);
  };

  const openEdit = (appointment: Appointment) => {
    setEditingId(appointment.id);
    setForm({
      title: appointment.title,
      providerName: appointment.providerName,
      specialty: appointment.specialty ?? "",
      startsAt: toLocalInput(appointment.startsAt),
      location: appointment.location ?? "",
      website: appointment.website ?? "",
    });
    setOpen(true);
  };

  const save = () => {
    if (!form.providerName.trim() || !form.startsAt) {
      toast.error("Provider and date are required");
      return;
    }
    const payload = {
      title: form.title,
      providerName: form.providerName.trim(),
      specialty: form.specialty,
      startsAt: new Date(form.startsAt).toISOString(),
      location: form.location,
      website: form.website,
    };
    if (editingId) {
      updateItem("appointments", editingId, payload as never);
      toast.success("Appointment updated");
    } else {
      add("appointments", { ...payload, questions: [], status: "upcoming" } as never);
      toast.success("Appointment added");
    }
    setOpen(false);
    setEditingId(null);
    setForm(empty);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Appointments"
        description="Walk in prepared, walk out with everything written down."
        actions={
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4" /> Add appointment
          </Button>
        }
      />

      <Panel title="Upcoming">
        {upcoming.length === 0 ? (
          <EmptyState title="Nothing scheduled" description="Add your next visit to start a preparation checklist." />
        ) : (
          <ul className="space-y-3">
            {upcoming.map((appointment) => (
              <li
                key={appointment.id}
                className="flex items-center gap-2 rounded-xl border border-border p-2 transition-colors hover:border-primary"
              >
                <Link
                  to="/appointments/$appointmentId"
                  params={{ appointmentId: appointment.id }}
                  className="flex flex-1 items-center justify-between gap-3 p-2"
                >
                  <div className="flex items-center gap-3">
                    <CalendarDays className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">
                        {appointment.providerName} · {appointment.specialty}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(appointment.startsAt), "EEEE, MMM d · HH:mm")}
                        {appointment.location ? ` · ${appointment.location}` : ""}
                      </p>
                    </div>
                  </div>
                  <StatusPill tone="brand">
                    {appointment.questions.length} question{appointment.questions.length === 1 ? "" : "s"}
                  </StatusPill>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Edit appointment with ${appointment.providerName}`}
                  onClick={() => openEdit(appointment)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {past.length > 0 ? (
        <Panel title="Past visits">
          <ul className="divide-y divide-border">
            {past.map((appointment) => (
              <li key={appointment.id} className="flex items-center justify-between py-3 text-sm">
                <span>
                  {appointment.providerName} · {appointment.specialty}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(appointment.startsAt), "MMM d, yyyy")}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Edit past visit with ${appointment.providerName}`}
                    onClick={() => openEdit(appointment)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit appointment" : "Add appointment"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Provider</Label>
              <Input
                value={form.providerName}
                onChange={(e) => setForm({ ...form, providerName: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Specialty</Label>
              <Input value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Date & time</Label>
              <Input
                type="datetime-local"
                value={form.startsAt}
                onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Website</Label>
              <Input
                placeholder="https://clinic.example"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <AddressAutocomplete
                label="Location"
                value={form.location}
                onChange={(location) => setForm({ ...form, location })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={save}>{editingId ? "Save changes" : "Save appointment"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
