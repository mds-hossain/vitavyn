import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { format } from "date-fns";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, PageHeader, Panel, StatusPill } from "@/components/vitavyn/primitives";
import { QuickAdd } from "@/components/vitavyn/QuickAdd";
import { useVitavyn } from "@/lib/vitavyn/store";

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

function SymptomsPage() {
  const { data, remove } = useVitavyn();
  const [addOpen, setAddOpen] = useState(false);

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
    </div>
  );
}
