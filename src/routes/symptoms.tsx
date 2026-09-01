import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { format } from "date-fns";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmptyState, PageHeader, Panel, StatusPill } from "@/components/vitavyn/primitives";
import { QuickAdd } from "@/components/vitavyn/QuickAdd";
import { EditRecordDialog } from "@/components/vitavyn/EditRecordDialog";
import { useVitavyn } from "@/lib/vitavyn/store";
import type { Symptom } from "@/lib/vitavyn/types";

export const Route = createFileRoute("/symptoms")({
  head: () => ({
    meta: [
      { title: "Symptoms — Vitavyn" },
      {
        name: "description",
        content: "Log symptoms in seconds with severity, duration and the condition they relate to.",
      },
      { property: "og:title", content: "Symptoms — Vitavyn" },
      { property: "og:description", content: "Fast symptom logging with severity and context." },
    ],
  }),
  component: SymptomsPage,
});

const toLocalInput = (iso: string) => format(new Date(iso), "yyyy-MM-dd'T'HH:mm");

function SymptomsPage() {
  const { data, remove, updateItem } = useVitavyn();
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<Symptom | null>(null);

  return (
    <div>
      <PageHeader
        title="Symptoms"
        description="Record what you feel, when it happened and how strong it was."
        actions={
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" /> Log symptom
          </Button>
        }
      />
      {data.symptoms.length === 0 ? (
        <EmptyState title="No symptoms recorded" description="Anything you log will appear here and on your timeline." />
      ) : (
        <Panel>
          <ul className="divide-y divide-border">
            {data.symptoms
              .slice()
              .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
              .map((symptom) => (
                <li key={symptom.id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <p className="text-sm font-medium">{symptom.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(symptom.occurredAt), "MMM d, yyyy · HH:mm")}
                      {symptom.durationMinutes ? ` · ${symptom.durationMinutes} min` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusPill tone={symptom.severity >= 4 ? "attention" : "neutral"}>
                      Severity {symptom.severity}/5
                    </StatusPill>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Edit symptom"
                      onClick={() => setEditing(symptom)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Remove symptom"
                      onClick={() => remove("symptoms", symptom.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
          </ul>
        </Panel>
      )}
      <QuickAdd open={addOpen} onOpenChange={setAddOpen} />

      <EditRecordDialog
        title="Edit symptom"
        open={!!editing}
        onOpenChange={(next) => (next ? null : setEditing(null))}
        fields={[
          { key: "name", label: "Symptom", full: true },
          { key: "severity", label: "Severity", type: "select", options: ["1", "2", "3", "4", "5"] },
          { key: "occurredAt", label: "When", type: "datetime-local" },
          { key: "durationMinutes", label: "Duration (min)", type: "number" },
          { key: "notes", label: "Notes", type: "textarea" },
        ]}
        values={{
          name: editing?.name ?? "",
          severity: String(editing?.severity ?? 3),
          occurredAt: editing ? toLocalInput(editing.occurredAt) : "",
          durationMinutes: editing?.durationMinutes ? String(editing.durationMinutes) : "",
          notes: editing?.notes ?? "",
        }}
        onSave={(next) => {
          if (!editing) return;
          updateItem("symptoms", editing.id, {
            name: next["name"] ?? editing.name,
            severity: Number(next["severity"] ?? editing.severity),
            occurredAt: next["occurredAt"]
              ? new Date(next["occurredAt"]).toISOString()
              : editing.occurredAt,
            durationMinutes: next["durationMinutes"] ? Number(next["durationMinutes"]) : null,
            notes: next["notes"] ?? "",
          } as never);
          setEditing(null);
          toast.success("Symptom updated");
        }}
      />
    </div>
  );
}
