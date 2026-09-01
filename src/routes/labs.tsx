import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { format } from "date-fns";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmptyState, PageHeader, Panel, StatusPill } from "@/components/vitavyn/primitives";
import { EditRecordDialog } from "@/components/vitavyn/EditRecordDialog";
import { useVitavyn } from "@/lib/vitavyn/store";
import type { LabResult } from "@/lib/vitavyn/types";

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

const toLocalInput = (iso: string) => format(new Date(iso), "yyyy-MM-dd'T'HH:mm");

function LabsPage() {
  const { data, remove, updateItem } = useVitavyn();
  const [editing, setEditing] = useState<LabResult | null>(null);

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
                    <div className="flex items-center gap-2">
                      <span className="metric-value text-base">
                        {lab.value} {lab.unit}
                      </span>
                      <StatusPill tone={outOfRange ? "attention" : "success"}>
                        {outOfRange ? "Outside range" : "In range"}
                      </StatusPill>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Edit ${lab.analyte}`}
                        onClick={() => setEditing(lab)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Remove ${lab.analyte}`}
                        onClick={() => remove("labResults", lab.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Panel>
        ))
      )}

      <EditRecordDialog
        title="Edit lab result"
        open={!!editing}
        onOpenChange={(next) => (next ? null : setEditing(null))}
        fields={[
          { key: "panel", label: "Panel" },
          { key: "analyte", label: "Analyte" },
          { key: "value", label: "Value", type: "number" },
          { key: "unit", label: "Unit" },
          { key: "referenceLow", label: "Reference low", type: "number" },
          { key: "referenceHigh", label: "Reference high", type: "number" },
          { key: "collectedAt", label: "Collected", type: "datetime-local", full: true },
        ]}
        values={{
          panel: editing?.panel ?? "",
          analyte: editing?.analyte ?? "",
          value: String(editing?.value ?? ""),
          unit: editing?.unit ?? "",
          referenceLow: editing?.referenceLow != null ? String(editing.referenceLow) : "",
          referenceHigh: editing?.referenceHigh != null ? String(editing.referenceHigh) : "",
          collectedAt: editing ? toLocalInput(editing.collectedAt) : "",
        }}
        onSave={(next) => {
          if (!editing) return;
          updateItem("labResults", editing.id, {
            panel: next["panel"] ?? editing.panel,
            analyte: next["analyte"] ?? editing.analyte,
            value: Number(next["value"] ?? editing.value),
            unit: next["unit"] ?? editing.unit,
            referenceLow: next["referenceLow"] ? Number(next["referenceLow"]) : null,
            referenceHigh: next["referenceHigh"] ? Number(next["referenceHigh"]) : null,
            collectedAt: next["collectedAt"]
              ? new Date(next["collectedAt"]).toISOString()
              : editing.collectedAt,
          } as never);
          setEditing(null);
          toast.success("Lab result updated");
        }}
      />
    </div>
  );
}
