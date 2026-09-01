import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { format } from "date-fns";
import { CalendarDays, CheckCircle2, Circle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MetricTile, Panel, SafetyNote, StatusPill } from "@/components/vitavyn/primitives";
import { QuickAdd } from "@/components/vitavyn/QuickAdd";
import { latestMeasurement, useVitavyn } from "@/lib/vitavyn/store";
import { formatGlucose, formatWeight, glucoseToMmol, round } from "@/lib/vitavyn/units";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Today — Vitavyn" },
      {
        name: "description",
        content:
          "Your day at a glance: scheduled medications, due measurements, upcoming appointments and quick logging.",
      },
      { property: "og:title", content: "Today — Vitavyn" },
      {
        property: "og:description",
        content: "Medications, measurements and appointments that matter to you today.",
      },
    ],
  }),
  component: TodayPage,
});

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function TodayPage() {
  const { data, update } = useVitavyn();
  const [addOpen, setAddOpen] = useState(false);
  const firstName = data.profile.name.split(" ")[0] ?? "";

  const glucose = latestMeasurement(data, "glucose");
  const bp = latestMeasurement(data, "blood_pressure");
  const weight = latestMeasurement(data, "weight");

  const todayKey = new Date().toDateString();
  const doses = data.medications
    .flatMap((med) =>
      med.times.map((time) => {
        const [h, m] = time.split(":");
        const scheduled = new Date();
        scheduled.setHours(Number(h), Number(m ?? 0), 0, 0);
        const recorded = data.medicationLogs.some(
          (log) =>
            log.medicationId === med.id &&
            new Date(log.scheduledFor).toDateString() === todayKey &&
            Math.abs(new Date(log.scheduledFor).getHours() - Number(h)) <= 1 &&
            log.status === "recorded",
        );
        return { med, time, scheduled, recorded };
      }),
    )
    .sort((a, b) => a.scheduled.getTime() - b.scheduled.getTime());

  const nextAppointment = data.appointments
    .filter((a) => a.status === "upcoming" && new Date(a.startsAt) >= new Date(Date.now() - 36e5))
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())[0];

  const recordDose = (medicationId: string, scheduled: Date) => {
    update((draft) => {
      draft.medicationLogs.unshift({
        id: `log-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        medicationId,
        scheduledFor: scheduled.toISOString(),
        recordedAt: new Date().toISOString(),
        status: "recorded",
      });
      return draft;
    });
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm text-muted-foreground">{format(new Date(), "EEEE, MMMM d")}</p>
        <h1 className="mt-1 text-3xl font-semibold sm:text-4xl">
          {greeting()}, {firstName}
        </h1>
      </header>

      <Panel title="Today's overview">
        <div className="grid gap-3 sm:grid-cols-3">
          <Overview value={`${doses.length}`} label="medications scheduled" />
          <Overview
            value={`${data.conditions.filter((c) => c.status === "active").length}`}
            label="conditions being tracked"
          />
          <Overview value={nextAppointment ? "1" : "0"} label="upcoming appointment" />
        </div>
      </Panel>

      <Panel
        title="Today's measurements"
        action={
          <Button variant="ghost" size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" /> Log
          </Button>
        }
      >
        <div className="grid gap-3 sm:grid-cols-3">
          {glucose ? (
            <MetricTile
              label="Blood glucose"
              value={formatGlucose(glucose.value, data.preferences.glucoseUnit)}
              secondary={
                data.preferences.glucoseUnit === "mg/dL"
                  ? `${round(glucoseToMmol(glucose.value), 1)} mmol/L`
                  : `${round(glucose.value, 0)} mg/dL`
              }
              context={`${glucose.context ?? ""} · ${format(new Date(glucose.takenAt), "MMM d, HH:mm")}`}
            />
          ) : null}
          {bp ? (
            <MetricTile
              label="Blood pressure"
              value={`${bp.value} / ${bp.secondaryValue}`}
              secondary="mmHg"
              context={format(new Date(bp.takenAt), "MMM d, HH:mm")}
            />
          ) : null}
          {weight ? (
            <MetricTile
              label="Weight"
              value={formatWeight(weight.value, data.preferences.weightUnit)}
              context={format(new Date(weight.takenAt), "MMM d")}
            />
          ) : null}
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Today's medications">
          <ul className="space-y-2">
            {doses.map(({ med, time, scheduled, recorded }) => (
              <li
                key={med.id + time}
                className="flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-3"
              >
                <div>
                  <p className="metric-value text-lg">{time}</p>
                  <p className="text-sm font-medium">
                    {med.name} {med.dose}
                    {med.unit}
                  </p>
                </div>
                {recorded ? (
                  <StatusPill tone="success">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Recorded
                  </StatusPill>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => recordDose(med.id, scheduled)}>
                    <Circle className="h-3.5 w-3.5" /> Record dose
                  </Button>
                )}
              </li>
            ))}
            {doses.length === 0 ? (
              <p className="text-sm text-muted-foreground">No medications scheduled today.</p>
            ) : null}
          </ul>
        </Panel>

        <div className="space-y-6">
          <Panel title="Upcoming appointment">
            {nextAppointment ? (
              <div className="space-y-3">
                <div>
                  <p className="font-display text-lg font-semibold">{nextAppointment.providerName}</p>
                  <p className="text-sm text-muted-foreground">{nextAppointment.specialty}</p>
                </div>
                <p className="flex items-center gap-2 text-sm">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  {format(new Date(nextAppointment.startsAt), "EEEE, MMM d · HH:mm")}
                </p>
                <Button asChild variant="outline" size="sm">
                  <Link to="/appointments/$appointmentId" params={{ appointmentId: nextAppointment.id }}>
                    View appointment
                  </Link>
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nothing scheduled yet.</p>
            )}
          </Panel>

          <Panel title="Quick actions">
            <div className="grid gap-2 sm:grid-cols-2">
              {["Log glucose", "Log blood pressure", "Add medication", "Add appointment"].map((action) => (
                <Button key={action} variant="outline" className="justify-start" onClick={() => setAddOpen(true)}>
                  <Plus className="h-4 w-4" /> {action}
                </Button>
              ))}
            </div>
          </Panel>
        </div>
      </div>

      <SafetyNote>
        Vitavyn organises information you record yourself. It does not diagnose conditions or
        adjust treatment. Demonstration data shown here is fictional.
      </SafetyNote>

      <QuickAdd open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}

function Overview({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl bg-accent/60 px-4 py-3">
      <span className="metric-value text-2xl text-accent-foreground">{value}</span>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
