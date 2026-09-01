import { createFileRoute } from "@tanstack/react-router";
import { format, subDays } from "date-fns";
import { MetricTile, PageHeader, Panel, SafetyNote } from "@/components/vitavyn/primitives";
import { MeasurementChart } from "@/components/vitavyn/MeasurementChart";
import { useVitavyn } from "@/lib/vitavyn/store";

export const Route = createFileRoute("/insights")({
  head: () => ({
    meta: [
      { title: "Insights — Vitavyn" },
      {
        name: "description",
        content: "Descriptive patterns from the data you recorded — adherence, logging streaks and measurement trends.",
      },
      { property: "og:title", content: "Insights — Vitavyn" },
      { property: "og:description", content: "Patterns described, never diagnosed." },
    ],
  }),
  component: InsightsPage,
});

function InsightsPage() {
  const { data } = useVitavyn();
  const cutoff = subDays(new Date(), 30);

  const recentMeasurements = data.measurements.filter((m) => new Date(m.takenAt) >= cutoff);
  const recentLogs = data.medicationLogs.filter((l) => new Date(l.scheduledFor) >= cutoff);
  const adherence = recentLogs.length
    ? Math.round((recentLogs.filter((l) => l.status === "recorded").length / recentLogs.length) * 100)
    : 0;

  const loggingDays = new Set(
    recentMeasurements.map((m) => format(new Date(m.takenAt), "yyyy-MM-dd")),
  ).size;

  const glucose = data.measurements.filter((m) => m.kind === "glucose");
  const average = glucose.length
    ? Math.round(glucose.reduce((sum, m) => sum + m.value, 0) / glucose.length)
    : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Insights"
        description="What your own records show over the last 30 days."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile label="Readings logged" value={String(recentMeasurements.length)} />
        <MetricTile label="Days with a log" value={String(loggingDays)} unit="/ 30" />
        <MetricTile label="Doses recorded" value={`${adherence}`} unit="%" />
        <MetricTile label="Average glucose" value={String(average)} unit={glucose[0]?.unit ?? "mg/dL"} />
      </div>

      <MeasurementChart measurements={glucose} title="Glucose trend" />

      <Panel title="Observations">
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>
            You logged on {loggingDays} of the last 30 days — consistency makes patterns easier to see.
          </li>
          <li>{adherence}% of scheduled doses in this period were marked as recorded.</li>
          <li>
            Most recent measurement:{" "}
            {data.measurements[0]
              ? `${data.measurements[0].label} on ${format(new Date(data.measurements[0].takenAt), "MMM d")}`
              : "none yet"}
            .
          </li>
        </ul>
      </Panel>

      <SafetyNote>
        These are descriptions of what you recorded, not medical advice, diagnosis or treatment recommendations.
      </SafetyNote>
    </div>
  );
}
