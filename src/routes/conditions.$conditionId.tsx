import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader, Panel, SafetyNote, StatusPill } from "@/components/vitavyn/primitives";
import { MeasurementChart } from "@/components/vitavyn/MeasurementChart";
import { useVitavyn } from "@/lib/vitavyn/store";

export const Route = createFileRoute("/conditions/$conditionId")({
  head: () => ({
    meta: [
      { title: "Condition detail — Vitavyn" },
      {
        name: "description",
        content:
          "A reusable condition dashboard with latest measurements, trends, medications, symptoms, appointments and lab results.",
      },
      { property: "og:title", content: "Condition detail — Vitavyn" },
      { property: "og:description", content: "Measurements, trends, medications and records for one condition." },
    ],
  }),
  component: ConditionDetail,
});

function ConditionDetail() {
  const { conditionId } = Route.useParams();
  const { data } = useVitavyn();
  const condition = data.conditions.find((c) => c.id === conditionId);
  if (!condition) throw notFound();

  const measurements = data.measurements
    .filter((m) => m.conditionId === condition.id)
    .sort((a, b) => new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime());
  const medications = data.medications.filter((m) => m.conditionIds.includes(condition.id));
  const symptoms = data.symptoms.filter((s) => s.conditionId === condition.id);
  const labs = data.labResults.filter((l) => l.conditionId === condition.id);
  const appointments = data.appointments.filter((a) => a.status === "upcoming");

  return (
    <div>
      <PageHeader
        title={condition.name}
        description={
          condition.diagnosedOn
            ? `Recorded since ${format(new Date(condition.diagnosedOn), "MMMM yyyy")}`
            : undefined
        }
        actions={<StatusPill tone="brand">{condition.status}</StatusPill>}
      />

      <Tabs defaultValue="overview">
        <TabsList className="mb-5 flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="measurements">Measurements</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="records">Records</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Panel title="Latest measurements">
              <ul className="space-y-2 text-sm">
                {measurements.slice(0, 5).map((m) => (
                  <li key={m.id} className="flex items-center justify-between gap-3">
                    <span>{m.label}</span>
                    <span className="metric-value text-base">
                      {m.kind === "blood_pressure" ? `${m.value}/${m.secondaryValue}` : m.value} {m.unit}
                    </span>
                  </li>
                ))}
                {measurements.length === 0 ? (
                  <p className="text-muted-foreground">No measurements recorded for this condition yet.</p>
                ) : null}
              </ul>
            </Panel>
            <Panel title="Related medication">
              <ul className="space-y-2 text-sm">
                {medications.map((m) => (
                  <li key={m.id} className="flex items-center justify-between">
                    <span>
                      {m.name} {m.dose}
                      {m.unit}
                    </span>
                    <span className="text-muted-foreground">{m.times.join(" · ")}</span>
                  </li>
                ))}
                {medications.length === 0 ? (
                  <p className="text-muted-foreground">No medication linked yet.</p>
                ) : null}
              </ul>
            </Panel>
            <Panel title="Recent symptoms">
              <ul className="space-y-2 text-sm">
                {symptoms.slice(0, 5).map((s) => (
                  <li key={s.id} className="flex items-center justify-between">
                    <span>{s.name}</span>
                    <span className="text-muted-foreground">
                      Severity {s.severity}/5 · {format(new Date(s.occurredAt), "MMM d")}
                    </span>
                  </li>
                ))}
                {symptoms.length === 0 ? <p className="text-muted-foreground">Nothing recorded.</p> : null}
              </ul>
            </Panel>
            <Panel title="Relevant appointments">
              <ul className="space-y-2 text-sm">
                {appointments.map((a) => (
                  <li key={a.id}>
                    <Link
                      to="/appointments/$appointmentId"
                      params={{ appointmentId: a.id }}
                      className="hover:text-primary"
                    >
                      {format(new Date(a.startsAt), "MMM d, HH:mm")} · {a.providerName}
                    </Link>
                  </li>
                ))}
                {appointments.length === 0 ? <p className="text-muted-foreground">None scheduled.</p> : null}
              </ul>
            </Panel>
          </div>
        </TabsContent>

        <TabsContent value="measurements">
          <MeasurementChart measurements={measurements} />
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Panel title="Your recorded pattern">
            <p className="text-sm text-muted-foreground">
              {measurements.length > 3
                ? `Your recorded readings show ${measurements.length} entries for ${condition.name}, most recently on ${format(new Date(measurements[0]!.takenAt), "MMMM d")}.`
                : "Record a few more readings to see patterns here."}
            </p>
          </Panel>
          <SafetyNote>
            Vitavyn describes what you recorded. It does not diagnose or recommend medication changes.
            Discuss anything that concerns you with your care team.
          </SafetyNote>
        </TabsContent>

        <TabsContent value="records">
          <Panel title="Lab results">
            <ul className="space-y-2 text-sm">
              {labs.map((l) => (
                <li key={l.id} className="flex items-center justify-between">
                  <span>
                    {l.analyte} · {l.panel}
                  </span>
                  <span className="metric-value text-base">
                    {l.value} {l.unit}
                  </span>
                </li>
              ))}
              {labs.length === 0 ? <p className="text-muted-foreground">No lab results linked.</p> : null}
            </ul>
          </Panel>
        </TabsContent>
      </Tabs>
    </div>
  );
}
