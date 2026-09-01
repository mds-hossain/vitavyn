import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EmptyState, PageHeader, Panel, StatusPill } from "@/components/vitavyn/primitives";
import { EditRecordDialog } from "@/components/vitavyn/EditRecordDialog";
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
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Condition | null>(null);
  const [name, setName] = useState("");
  const [metrics, setMetrics] = useState("");

  const save = () => {
    if (!name.trim()) {
      toast.error("Give the condition a name");
      return;
    }
    add("conditions", {
      name: name.trim(),
      status: "active",
      trackedMetrics: metrics
        .split(",")
        .map((m) => m.trim())
        .filter(Boolean),
    } as never);
    setName("");
    setMetrics("");
    setOpen(false);
    toast.success("Condition added");
  };

  return (
    <div>
      <PageHeader
        title="Conditions"
        description="Conditions are the foundation of Vitavyn. Add any condition — the app is not limited to a fixed list."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4" /> Add condition
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add condition</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Condition name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Thyroid" />
                </div>
                <div className="space-y-1.5">
                  <Label>Tracked metrics (comma separated)</Label>
                  <Input
                    value={metrics}
                    onChange={(e) => setMetrics(e.target.value)}
                    placeholder="TSH, T3, T4"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={save}>Save condition</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
                <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
                  {condition.trackedMetrics.map((metric) => (
                    <li key={metric}>{metric}</li>
                  ))}
                </ul>
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

      <EditRecordDialog
        title="Edit condition"
        open={!!editing}
        onOpenChange={(next) => (next ? null : setEditing(null))}
        fields={[
          { key: "name", label: "Condition name", full: true },
          { key: "status", label: "Status", type: "select", options: ["active", "monitoring", "resolved"] },
          { key: "diagnosedOn", label: "Diagnosed on", type: "date" },
          { key: "trackedMetrics", label: "Tracked metrics (comma separated)", full: true },
          { key: "notes", label: "Notes", type: "textarea" },
        ]}
        values={{
          name: editing?.name ?? "",
          status: editing?.status ?? "active",
          diagnosedOn: editing?.diagnosedOn ? editing.diagnosedOn.slice(0, 10) : "",
          trackedMetrics: editing?.trackedMetrics.join(", ") ?? "",
          notes: editing?.notes ?? "",
        }}
        onSave={(next) => {
          if (!editing) return;
          updateItem("conditions", editing.id, {
            name: next["name"] ?? editing.name,
            status: (next["status"] ?? editing.status) as typeof editing.status,
            diagnosedOn: next["diagnosedOn"] || undefined,
            trackedMetrics: (next["trackedMetrics"] ?? "")
              .split(",")
              .map((m) => m.trim())
              .filter(Boolean),
            notes: next["notes"] ?? "",
          } as never);
          setEditing(null);
          toast.success("Condition updated");
        }}
      />
    </div>
  );
}
