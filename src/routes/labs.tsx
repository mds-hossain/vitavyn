import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";
import { EmptyState, PageHeader, Panel, StatusPill } from "@/components/vitavyn/primitives";
import { useVitavyn } from "@/lib/vitavyn/store";

export const Route = createFileRoute("/labs")({
  head: () => ({
    meta: [
      { title: "Lab results — Vitavyn" },
      {
        name: "description",
        content: "Structured lab results with reference ranges, grouped by panel and collection date.",
      },
      { property: "og:title", content: "Lab results — Vitavyn" },
      { property: "og:description", content: "Panels, analytes and reference ranges in plain language." },
    ],
  }),
  component: LabsPage,
});

function LabsPage() {
  const { data } = useVitavyn();

  const grouped = data.labResults.reduce<Record<string, typeof data.labResults>>((acc, lab) => {
    const key = `${lab.panel} · ${format(new Date(lab.collectedAt), "MMM d, yyyy")}`;
    (acc[key] ??= []).push(lab);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lab results"
        description="Vitavyn shows where a value sits against the lab's own reference range. It does not interpret results."
      />
      {data.labResults.length === 0 ? (
        <EmptyState title="No lab results" description="Add lab values to see them grouped by panel." />
      ) : (
        Object.entries(grouped).map(([panel, labs]) => (
          <Panel key={panel} title={panel}>
            <ul className="divide-y divide-border">
              {labs.map((lab) => {
                const low = lab.referenceLow ?? null;
                const high = lab.referenceHigh ?? null;
                const outOfRange =
                  (low !== null && lab.value < low) || (high !== null && lab.value > high);
                return (
                  <li key={lab.id} className="flex items-center justify-between gap-3 py-3">
                    <div>
                      <p className="text-sm font-medium">{lab.analyte}</p>
                      {low !== null || high !== null ? (
                        <p className="text-xs text-muted-foreground">
                          Reference {low ?? "—"}–{high ?? "—"} {lab.unit}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="metric-value text-base">
                        {lab.value} {lab.unit}
                      </span>
                      <StatusPill tone={outOfRange ? "attention" : "success"}>
                        {outOfRange ? "Outside range" : "In range"}
                      </StatusPill>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Panel>
        ))
      )}
    </div>
  );
}
