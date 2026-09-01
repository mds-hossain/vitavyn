import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { format } from "date-fns";
import { CalendarDays, Plus } from "lucide-react";
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
import { useVitavyn } from "@/lib/vitavyn/store";

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

function AppointmentsPage() {
  const { data, add } = useVitavyn();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "Follow-up visit",
    providerName: "",
    specialty: "",
    startsAt: "",
    location: "",
  });

  const upcoming = data.appointments
    .filter((a) => a.status === "upcoming")
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
  const past = data.appointments.filter((a) => a.status !== "upcoming");

  const save = () => {
    if (!form.providerName.trim() || !form.startsAt) {
      toast.error("Provider and date are required");
      return;
    }
    add("appointments", {
      title: form.title,
      providerName: form.providerName.trim(),
      specialty: form.specialty,
      startsAt: new Date(form.startsAt).toISOString(),
      location: form.location,
      questions: [],
      status: "upcoming",
    } as never);
    setOpen(false);
    setForm({ ...form, providerName: "", specialty: "", startsAt: "", location: "" });
    toast.success("Appointment added");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Appointments"
        description="Walk in prepared, walk out with everything written down."
        actions={
          <Button onClick={() => setOpen(true)}>
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
              <li key={appointment.id}>
                <Link
                  to="/appointments/$appointmentId"
                  params={{ appointmentId: appointment.id }}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border p-4 transition-colors hover:border-primary"
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
                <span className="text-xs text-muted-foreground">
                  {format(new Date(appointment.startsAt), "MMM d, yyyy")}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add appointment</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
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
              <Label>Location</Label>
              <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={save}>Save appointment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
