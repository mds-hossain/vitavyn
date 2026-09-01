import { createFileRoute, Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { Activity, ChartLine, ClipboardList, History } from "lucide-react";
import { PageHeader, Panel, StatusPill } from "@/components/vitavyn/primitives";
import { MeasurementCard } from "@/components/vitavyn/MeasurementCard";
import { buildTimeline, useVitavyn } from "@/lib/vitavyn/store";
import { measurementsOfKind, relevantKinds } from "@/lib/vitavyn/personalize";

export const Route = createFileRoute("/health")({
  head: () => ({
    meta: [
      { title: "My Health — Vitavyn" },
      {
        name: "description",
        content: "Active conditions, current measurements, recent activity and your health timeline in one hub.",
      },
      { property: "og:title", content: "My Health — Vitavyn" },
      {
        property: "og:description",
        content: "Conditions, measurements, symptoms and timeline in one place.",
      },
    ],
  }),
  component: HealthHub,
});

function HealthHub() {
  const { data } = useVitavyn();
  const kinds = relevantKinds(data);
  const active = data.conditions.filter((c) => c.status !== "resolved");
  const timeline = buildTimeline(data).slice(0, 6);

  const shortcuts = [
    { to: "/conditions" as const, title: "Conditions", icon: Activity, detail: `${data.conditions.length} tracked` },
    { to: "/measurements" as const, title: "Measurements", icon: ChartLine, detail: `${data.measurements.length} recorded` },
    { to: "/symptoms" as const, title: "Symptoms", icon: ClipboardList, detail: `${data.symptoms.length} recorded` },
    { to: "/timeline" as const, title: "Timeline", icon: History, detail: "Everything, in order" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Health"
        description="One structured picture of the whole person — not a single disease."
      />

      <Panel title="Active conditions">
        {active.length === 0 ? (
          <p className="text-sm text-muted-foreground">No conditions tracked yet.</p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {active.map((condition) => {
              const meds = data.medications.filter((m) => m.conditionIds.includes(condition.id)).length;
              const symptoms = data.symptoms.filter((s) => s.conditionId === condition.id).length;
              const labs = data.labResults.filter((l) => l.conditionId === condition.id).length;
              return (
                <li key={condition.id}>
                  <Link
                    to="/conditions/$conditionId"
                    params={{ conditionId: condition.id }}
                    className="block rounded-xl border border-border bg-background/60 px-4 py-3 transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.99]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="min-w-0 truncate font-medium">{condition.name}</span>
                      <StatusPill tone={condition.status === "active" ? "brand" : "neutral"}>
                        {condition.status}
                      </StatusPill>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {meds} medications · {symptoms} symptoms · {labs} lab results
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      {kinds.length > 0 ? (
        <Panel title="Current measurements">
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
        <Panel title="Recent activity">
          <ul className="divide-y divide-border">
            {timeline.map((event) => (
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
            {timeline.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing recorded yet.</p>
            ) : null}
          </ul>
        </Panel>

        <Panel title="Explore">
          <div className="grid gap-3 sm:grid-cols-2">
            {shortcuts.map((section) => (
              <Link
                key={section.to}
                to={section.to}
                className="rounded-xl border border-border bg-background/60 p-4 transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.99]"
              >
                <section.icon className="h-5 w-5 text-primary" />
                <h3 className="mt-3 text-sm font-semibold">{section.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{section.detail}</p>
              </Link>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
