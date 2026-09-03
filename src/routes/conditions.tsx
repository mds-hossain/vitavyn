import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, PageHeader, Panel, StatusPill } from "@/components/vitavyn/primitives";
import {
  ConditionFormDialog,
  type ConditionFormValues,
} from "@/components/vitavyn/ConditionFormDialog";
import { useVitavyn } from "@/lib/vitavyn/store";
import type { Condition } from "@/lib/vitavyn/types";

export const Route = createFileRoute("/conditions")({
  head: () => ({
    meta: [
      { title: "Conditions — Vitavyn" },
      {
        name: "description",
        content:
          "Track one condition or many. Every condition gets its own dashboard, metrics, medications and records.",
      },
      { property: "og:title", content: "Conditions — Vitavyn" },
      { property: "og:description", content: "Condition-agnostic tracking for the whole person." },
    ],
  }),
  component: ConditionsPage,
});

function ConditionsPage() {
  const { data, add, updateItem } = useVitavyn();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Condition | null>(null);

  const save = (values: ConditionFormValues) => {
    if (!values.name.trim()) {
      toast.error("Give the condition a name");
      return;
    }
    const payload = {
      name: values.name.trim(),
      status: values.status,
      diagnosedOn: values.diagnosedOn || undefined,
      trackedMetrics: values.trackedMetrics,
      notes: values.notes,
    };
    if (editing) {
      updateItem("conditions", editing.id, payload as never);
      setEditing(null);
      toast.success("Condition updated");
    } else {
      add("conditions", payload as never);
      setAdding(false);
      toast.success("Condition added");
    }
  };

  const formValues = (c: Condition | null): ConditionFormValues => ({
    name: c?.name ?? "",
    status: c?.status ?? "active",
    diagnosedOn: c?.diagnosedOn ? c.diagnosedOn.slice(0, 10) : "",
    trackedMetrics: c?.trackedMetrics ?? [],
    notes: c?.notes ?? "",
  });

  return (
    <div>
      <PageHeader
        title="Conditions"
        description="Conditions are the foundation of Vitavyn. Add any condition — the app is not limited to a fixed list."
        actions={
          <Button onClick={() => setAdding(true)}>
            <Plus className="h-4 w-4" strokeWidth={1.75} /> Add condition
          </Button>
        }
      />

      {data.conditions.length === 0 ? (
        <EmptyState
          title="No conditions yet"
          description="Add a condition to unlock its dashboard, measurements, medications and records."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.conditions.map((condition) => (
            <Panel key={condition.id} className="flex h-full flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-display text-lg font-semibold">{condition.name}</h2>
                  <StatusPill tone={condition.status === "active" ? "brand" : "neutral"}>
                    {condition.status}
                  </StatusPill>
                </div>
                {condition.diagnosedOn ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Diagnosed {format(new Date(condition.diagnosedOn), "dd/MM/yyyy")}
                  </p>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {condition.trackedMetrics.map((metric) => (
                    <span
                      key={metric}
                      className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground"
                    >
                      {metric}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between">
                <Button asChild variant="ghost" className="justify-start px-0">
                  <Link to="/conditions/$conditionId" params={{ conditionId: condition.id }}>
                    View →
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`Edit ${condition.name}`}
                  onClick={() => setEditing(condition)}
                >
                  Edit
                </Button>
              </div>
            </Panel>
          ))}
        </div>
      )}

      <ConditionFormDialog
        mode={editing ? "edit" : "add"}
        open={adding || !!editing}
        onOpenChange={(next) => {
          if (!next) {
            setAdding(false);
            setEditing(null);
          }
        }}
        initial={formValues(editing)}
        customMetrics={data.customMetrics ?? []}
        onCreateCustomMetric={(metric) => add("customMetrics", metric as never)}
        onSave={save}
      />
    </div>
  );
}
