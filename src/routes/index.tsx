import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { format, formatDistanceToNowStrict, isSameDay, isTomorrow } from "date-fns";
import {
  Ban,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Pill,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Panel, SafetyNote } from "@/components/vitavyn/primitives";
import { MeasurementCard } from "@/components/vitavyn/MeasurementCard";
import { QuickAdd } from "@/components/vitavyn/QuickAdd";
import { buildTimeline, useVitavyn } from "@/lib/vitavyn/store";
import { formatTimeOfDay, mealContextLabel, medFormIcon } from "@/lib/vitavyn/medication";
import {
  KIND_LABELS,
  doseState,
  measurementsOfKind,
  relevantKinds,
  todaysDoses,
} from "@/lib/vitavyn/personalize";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Today — Vitavyn" },
      {
        name: "description",
        content:
          "Your day at a glance: what needs attention, medication progress, measurements due and upcoming appointments.",
      },
      { property: "og:title", content: "Today — Vitavyn" },
      {
        property: "og:description",
        content: "See what needs your attention today and record it in a couple of taps.",
      },
    ],
  }),
  component: TodayPage,
});

function greeting(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function TodayPage() {
  const { data, update, remove } = useVitavyn();
  const [addOpen, setAddOpen] = useState(false);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  const firstName = data.profile.name.split(" ")[0] ?? "";
  const reference = now ?? new Date();

  const doses = now ? todaysDoses(data, now) : [];
  const recorded = doses.filter((d) => d.status === "recorded").length;
  const pending = doses.filter((d) => d.status === "pending");
  const dueNow = pending.filter((d) => doseState(d, reference) === "due");

  const kinds = relevantKinds(data);
  const staleKinds = !now ? [] : kinds.filter((kind) => {
    const latest = measurementsOfKind(data, kind)[0];
    return !latest || !isSameDay(new Date(latest.takenAt), reference);
  });

  const nextAppointment = data.appointments
    .filter((a) => a.status === "upcoming" && new Date(a.startsAt) >= new Date(reference.getTime() - 36e5))
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())[0];

  const attention: { icon: typeof Pill; text: string; to: string }[] = [];
  if (now && dueNow.length > 0)
    attention.push({
      icon: Pill,
      text: `${dueNow.length} medication ${dueNow.length === 1 ? "dose" : "doses"} to record`,
      to: "/medications",
    });
  if (now && staleKinds.length > 0)
    attention.push({
      icon: Clock,
      text: `${staleKinds.map((k) => KIND_LABELS[k] ?? k).join(", ")} not recorded today`,
      to: "/measurements",
    });
  if (now && nextAppointment && isTomorrow(new Date(nextAppointment.startsAt)))
    attention.push({
      icon: CalendarDays,
      text: `Appointment tomorrow with ${nextAppointment.providerName}`,
      to: "/appointments",
    });

  const recentEvents = buildTimeline(data).slice(0, 5);

  const twelveHour = data.preferences.timeFormat === "12h";

  const markDose = (dose: (typeof doses)[number], status: "recorded" | "skipped") => {
    update((draft) => {
      draft.medicationLogs.unshift({
        id: `log-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        medicationId: dose.medicationId,
        scheduledFor: dose.scheduled.toISOString(),
        recordedAt: new Date().toISOString(),
        status,
      });
      return draft;
    });
  };

  /** Undo a "not taken" mark without losing the card. */
  const undoDose = (logId?: string) => {
    if (logId) remove("medicationLogs", logId);
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm text-muted-foreground">
          {now ? format(now, "EEEE, MMMM d") : "\u00a0"}
        </p>
        <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">
          {now ? greeting(now.getHours()) : "Hello"}, {firstName}
        </h1>
      </header>

      <Panel title="Your health today">
        {attention.length === 0 ? (
          <div className="flex items-center gap-3 rounded-xl bg-success/10 px-4 py-3 text-sm">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
            <span>Nothing needs your attention right now.</span>
          </div>
        ) : (
          <>
            <p className="text-base font-medium">
              {attention.length} {attention.length === 1 ? "thing needs" : "things need"} your attention
            </p>
            <ul className="mt-3 space-y-2">
              {attention.map((item) => (
                <li key={item.text}>
                  <Link
                    to={item.to}
                    className="flex items-center gap-3 rounded-xl border border-border bg-background/60 px-4 py-3 text-sm transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.99]"
                  >
                    <item.icon className="h-4 w-4 shrink-0 text-primary" />
                    <span className="min-w-0 flex-1">{item.text}</span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-border px-4 py-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Medications</span>
              <span className="text-muted-foreground">
                {recorded} of {doses.length} recorded
              </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted" role="presentation">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${doses.length ? (recorded / doses.length) * 100 : 0}%` }}
              />
            </div>
          </div>
          <div className="rounded-xl border border-border px-4 py-3 text-sm">
            <span className="font-medium">Next appointment</span>
            <p className="mt-1 text-muted-foreground">
              {now && nextAppointment
                ? `${nextAppointment.providerName} · ${format(new Date(nextAppointment.startsAt), "MMM d, HH:mm")}`
                : "Nothing scheduled"}
            </p>
          </div>
        </div>
      </Panel>

      {kinds.length > 0 ? (
        <Panel
          title="Your measurements"
          action={
            <Button variant="ghost" size="sm" onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4" /> Log
            </Button>
          }
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {kinds.map((kind) => (
              <MeasurementCard
                key={kind}
                kind={kind}
                measurements={measurementsOfKind(data, kind)}
                prefs={data.preferences}
              />
            ))}
          </div>
        </Panel>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Today's medications">
          <ul className="space-y-2">
            {doses.map((dose) => {
              const state = doseState(dose, reference);
              const Icon = medFormIcon(dose.form);
              const notTaken = state === "not-taken";

              const timeBlock = (
                <div className="min-w-0">
                  <p className="metric-value text-sm">
                    {formatTimeOfDay(dose.time, twelveHour)}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {mealContextLabel(dose.mealContext)}
                  </p>
                </div>
              );

              const actions = state === "upcoming" ? (
                <span className="shrink-0 text-xs text-muted-foreground">
                  in {formatDistanceToNowStrict(dose.scheduled)}
                </span>
              ) : notTaken ? (
                <button
                  type="button"
                  onClick={() => undoDose(dose.logId)}
                  aria-label="Undo not taken"
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
                >
                  <Ban className="h-3.5 w-3.5" strokeWidth={1.75} /> Not taken
                </button>
              ) : state === "recorded" ? (
                <button
                  type="button"
                  onClick={() => undoDose(dose.logId)}
                  aria-label={`${dose.name} recorded — tap to undo`}
                  title="Recorded — tap to undo"
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-success transition-transform active:scale-95"
                >
                  <Check className="h-3 w-3" strokeWidth={1.75} />
                </button>
              ) : (
                <div className="flex shrink-0 items-center gap-1.5">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => markDose(dose, "recorded")}
                    aria-label={`Record ${dose.name}`}
                    title="Record dose"
                    className="rounded-full border border-border text-muted-foreground hover:border-success hover:text-success active:scale-95"
                  >
                    <Check className="h-3 w-3" strokeWidth={1.75} />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`Mark ${dose.name} not taken`}
                    title="Mark not taken"
                    onClick={() => markDose(dose, "skipped")}
                    className="rounded-full border border-border text-muted-foreground active:scale-95"
                  >
                    <Ban className="h-3 w-3" strokeWidth={1.75} />
                  </Button>
                </div>
              );

              const nameBlock = (
                <p className="flex min-w-0 items-center gap-2 text-sm font-medium">
                  <Icon className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.75} />
                  <span className="truncate">
                    {dose.name} {dose.dose} {dose.unit}
                  </span>
                </p>
              );

              const conditionChip = dose.conditionName ? (
                <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {dose.conditionName}
                </span>
              ) : null;

              return (
                <li
                  key={dose.medicationId + dose.time}
                  className={`rounded-xl border border-border px-4 py-3 transition-opacity ${
                    notTaken ? "opacity-50" : ""
                  }`}
                >
                  {/* Mobile: compact stack */}
                  <div className="sm:hidden">
                    <div className="flex items-start justify-between gap-3">
                      {timeBlock}
                      {actions}
                    </div>
                    <div className="mt-1.5">{nameBlock}</div>
                    {conditionChip ? <div className="mt-2">{conditionChip}</div> : null}
                  </div>

                  {/* Web: three columns */}
                  <div className="hidden items-center gap-4 sm:flex">
                    <div className="w-24 shrink-0">{timeBlock}</div>
                    <div className="min-w-0 flex-1">
                      {nameBlock}
                      {conditionChip ? <div className="mt-1.5">{conditionChip}</div> : null}
                    </div>
                    {actions}
                  </div>
                </li>
              );
            })}
            {doses.length === 0 ? (
              <p className="text-sm text-muted-foreground">No medications scheduled today.</p>
            ) : null}
          </ul>
        </Panel>

        <Panel
          title="Recent activity"
          action={
            <Button asChild variant="ghost" size="sm">
              <Link to="/timeline">Timeline</Link>
            </Button>
          }
        >
          <ul className="divide-y divide-border">
            {recentEvents.map((event) => (
              <li key={event.type + event.id} className="flex items-start gap-3 py-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{event.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{event.detail}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {format(new Date(event.at), "MMM d")}
                </span>
              </li>
            ))}
            {recentEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing recorded yet.</p>
            ) : null}
          </ul>
        </Panel>
      </div>

      <SafetyNote>
        Vitavyn organises information you record yourself. It does not diagnose conditions or adjust
        treatment. Demonstration data shown here is fictional.
      </SafetyNote>

      <QuickAdd open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}
