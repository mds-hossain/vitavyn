import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { format } from "date-fns";
import { Activity, CalendarDays, FlaskConical, Pill, Plus, StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SymptomFormDialog } from "@/components/vitavyn/SymptomFormDialog";
import { PageHeader, Panel, SafetyNote, StatusPill } from "@/components/vitavyn/primitives";
import { MeasurementCard } from "@/components/vitavyn/MeasurementCard";
import { useVitavyn } from "@/lib/vitavyn/store";
import { kindForMetric } from "@/lib/vitavyn/conditionSeed";
import { isPastMedication } from "@/lib/vitavyn/medication";

export const Route = createFileRoute("/conditions/$conditionId")({
  head: () => ({
    meta: [
      { title: "Condition detail — Vitavyn" },
      {
        name: "description",
        content:
          "A condition dashboard with key metrics and 7-day trends, linked medications and appointments, and a tagged history timeline.",
      },
      { property: "og:title", content: "Condition detail — Vitavyn" },
      {
        property: "og:description",
        content: "Key metrics, linked care and history for a single condition.",
      },
    ],
  }),
  component: ConditionDetail,
});

function ConditionDetail() {
  const { conditionId } = Route.useParams();
  const { data } = useVitavyn();
  const [symptomOpen, setSymptomOpen] = useState(false);
  const condition = data.conditions.find((c) => c.id === conditionId);
  if (!condition) throw notFound();

  const prefs = data.preferences;
  const weekAgo = Date.now() - 7 * 86400000;

  // Section 1 — only the kinds this condition explicitly tracks.
  const trackedKinds = [
    ...new Set(
      condition.trackedMetrics
        .map((metric) => kindForMetric(metric))
        .filter((k): k is string => !!k),
    ),
  ];
  const seriesFor = (kind: string) =>
    data.measurements
      .filter((m) => m.kind === kind)
      .filter((m) => !m.conditionId || m.conditionId === condition.id)
      .sort((a, b) => new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime());

  const untrackedMetrics = condition.trackedMetrics.filter((m) => !kindForMetric(m));

  // Section 2 — linked care.
  const medications = data.medications.filter(
    (m) => m.conditionIds.includes(condition.id) && !isPastMedication(m, new Date()),
  );
  const appointments = data.appointments
    .filter((a) => a.status === "upcoming")
    .filter((a) => {
      const haystack = `${a.title} ${a.purpose ?? ""} ${a.specialty}`.toLowerCase();
      if (haystack.includes(condition.name.toLowerCase())) return true;
      // Fall back to significant words from the condition name (e.g. "diabetes").
      return condition.name
        .toLowerCase()
        .split(/\s+/)
        .filter((word) => word.length > 4)
        .some((word) => haystack.includes(word));
    })
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());

  // Section 3 — history tagged to this condition.
  const history = [
    ...data.labResults
      .filter((l) => l.conditionId === condition.id)
      .map((l) => ({
        id: l.id,
        at: l.collectedAt,
        icon: FlaskConical,
        title: `${l.analyte} · ${l.panel}`,
        detail: `${l.value} ${l.unit}`,
      })),
    ...data.symptoms
      .filter((s) => s.conditionId === condition.id)
      .map((s) => ({
        id: s.id,
        at: s.occurredAt,
        icon: StickyNote,
        title: s.name,
        detail: `Severity ${s.severity}/5${s.notes ? ` · ${s.notes}` : ""}`,
      })),
    ...(condition.notes
      ? [
          {
            id: `${condition.id}-note`,
            at: condition.updatedAt,
            icon: StickyNote,
            title: "Condition note",
            detail: condition.notes,
          },
        ]
      : []),
  ].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  const conditionSymptoms = data.symptoms
    .filter((s) => s.conditionId === condition.id)
    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());

  return (
    <div>
      <PageHeader
        title={condition.name}
        description={
          condition.diagnosedOn
            ? `Diagnosed ${format(new Date(condition.diagnosedOn), "dd/MM/yyyy")}`
            : "No diagnosis date recorded"
        }
        actions={<StatusPill tone="brand">{condition.status}</StatusPill>}
      />

      <div className="space-y-6">
        <Panel
          title="Key metrics"
          action={
            <Link
              to="/measurements"
              search={{ condition: condition.id, metric: "" }}
              className="text-sm font-medium text-primary hover:underline"
            >
              Open in Measurements →
            </Link>
          }
        >
          {trackedKinds.length === 0 && untrackedMetrics.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No metrics linked yet. Edit this condition to add tracked metrics.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {trackedKinds.map((kind) => {
                  const series = seriesFor(kind);
                  if (series.length === 0) return null;
                  const week = series.filter((m) => new Date(m.takenAt).getTime() >= weekAgo);
                  return (
                    <MeasurementCard
                      conditionId={condition.id}
                      key={kind}
                      kind={kind}
                      measurements={week.length > 0 ? week : series.slice(0, 7)}
                      prefs={prefs}
                    />
                  );
                })}
              </div>
              {untrackedMetrics.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {untrackedMetrics.map((metric) => {
                    const latest = data.measurements
                      .filter((m) => m.kind === "custom" && m.label === metric)
                      .filter((m) => !m.conditionId || m.conditionId === condition.id)
                      .sort((a, b) => new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime())[0];
                    return (
                      <Link
                        key={metric}
                        to="/measurements"
                        search={{ condition: condition.id, metric }}
                        className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                      >
                        {metric} · {latest ? `${latest.value} ${latest.unit}`.trim() : "add reading"}
                      </Link>
                    );
                  })}
                </div>
              ) : null}
            </div>
          )}
        </Panel>

        <div className="grid gap-6 lg:grid-cols-2">
          <Panel title="Linked medications">
            <ul className="space-y-3 text-sm">
              {medications.map((m) => (
                <li key={m.id} className="flex items-start justify-between gap-3">
                  <span className="flex items-center gap-2">
                    <Pill className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
                    <span className="font-medium">
                      {m.name} {m.dose} {m.unit}
                    </span>
                  </span>
                  <span className="text-right text-muted-foreground">
                    {(m.schedule?.map((s) => s.time) ?? m.times).join(" · ")}
                  </span>
                </li>
              ))}
              {medications.length === 0 ? (
                <p className="text-muted-foreground">No active medication linked to this condition.</p>
              ) : null}
            </ul>
          </Panel>

          <Panel title="Upcoming appointments">
            <ul className="space-y-3 text-sm">
              {appointments.map((a) => (
                <li key={a.id} className="flex items-start gap-2">
                  <CalendarDays className="mt-0.5 h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
                  <Link
                    to="/appointments/$appointmentId"
                    params={{ appointmentId: a.id }}
                    className="hover:text-primary"
                  >
                    <span className="font-medium">{format(new Date(a.startsAt), "dd/MM/yyyy HH:mm")}</span>
                    <span className="block text-muted-foreground">
                      {a.providerName} · {a.specialty}
                    </span>
                  </Link>
                </li>
              ))}
              {appointments.length === 0 ? (
                <p className="text-muted-foreground">Nothing scheduled.</p>
              ) : null}
            </ul>
          </Panel>
        </div>

        <Panel
          title="Symptoms"
          action={
            <Button size="sm" variant="outline" onClick={() => setSymptomOpen(true)}>
              <Plus className="h-4 w-4" /> Log symptom
            </Button>
          }
        >
          <ul className="space-y-3 text-sm">
            {conditionSymptoms.slice(0, 6).map((s) => (
              <li key={s.id} className="flex items-start justify-between gap-3">
                <span className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
                  <span>
                    <span className="font-medium">{s.name}</span>
                    <span className="block text-xs text-muted-foreground">
                      {format(new Date(s.occurredAt), "dd/MM/yyyy · HH:mm")}
                      {s.durationMinutes ? ` · ${s.durationMinutes} min` : ""}
                    </span>
                  </span>
                </span>
                <StatusPill tone={s.severity >= 4 ? "attention" : "neutral"}>
                  Severity {s.severity}/5
                </StatusPill>
              </li>
            ))}
            {conditionSymptoms.length === 0 ? (
              <p className="text-muted-foreground">
                No symptoms logged for this condition yet.
              </p>
            ) : null}
          </ul>
          {conditionSymptoms.length > 0 ? (
            <Link
              to="/symptoms"
              search={{ condition: condition.id }}
              className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
            >
              See all symptoms →
            </Link>
          ) : null}
        </Panel>

        <SymptomFormDialog
          open={symptomOpen}
          onOpenChange={setSymptomOpen}
          defaultConditionId={condition.id}
        />

        <Panel title="History">
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nothing tagged to this condition yet. Lab results, symptoms and notes appear here.
            </p>
          ) : (
            <ol className="relative space-y-5 border-l border-border pl-5">
              {history.map((event) => (
                <li key={event.id} className="relative">
                  <span className="absolute -left-[27px] top-1 flex h-4 w-4 items-center justify-center rounded-full border border-border bg-background">
                    <event.icon className="h-2.5 w-2.5 text-muted-foreground" strokeWidth={2} />
                  </span>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(event.at), "dd/MM/yyyy")}
                  </p>
                  <p className="text-sm font-medium">{event.title}</p>
                  <p className="text-sm text-muted-foreground">{event.detail}</p>
                </li>
              ))}
            </ol>
          )}
        </Panel>

        <SafetyNote>
          Vitavyn describes what you recorded. It does not diagnose or recommend medication changes.
          Discuss anything that concerns you with your care team.
        </SafetyNote>
      </div>
    </div>
  );
}
