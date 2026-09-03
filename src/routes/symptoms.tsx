import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState, PageHeader, Panel, StatusPill } from "@/components/vitavyn/primitives";
import { SymptomFormDialog } from "@/components/vitavyn/SymptomFormDialog";
import { useVitavyn } from "@/lib/vitavyn/store";
import type { Symptom } from "@/lib/vitavyn/types";

export const Route = createFileRoute("/symptoms")({
  validateSearch: (search: Record<string, unknown>) => ({
    condition: typeof search["condition"] === "string" ? (search["condition"] as string) : "",
  }),
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
  const search = useSearch({ from: "/symptoms" });
  const [filter, setFilter] = useState<string>(search.condition || "all");
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<Symptom | null>(null);

  const conditionName = (id?: string | null) =>
    id ? data.conditions.find((c) => c.id === id)?.name ?? null : null;

  const visible = useMemo(() => {
    const sorted = data.symptoms
      .slice()
      .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
    if (filter === "all") return sorted;
    if (filter === "unlinked") return sorted.filter((s) => !s.conditionId);
    return sorted.filter((s) => s.conditionId === filter);
  }, [data.symptoms, filter]);

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

      <div className="mb-4 max-w-xs">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger>
            <SelectValue placeholder="All conditions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All conditions</SelectItem>
            <SelectItem value="unlinked">Not linked</SelectItem>
            {data.conditions.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          title="No symptoms recorded"
          description="Anything you log will appear here, on your timeline and on the linked condition."
        />
      ) : (
        <Panel>
          <ul className="divide-y divide-border">
            {visible.map((symptom) => {
              const linked = conditionName(symptom.conditionId);
              return (
                <li
                  key={symptom.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{symptom.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(symptom.occurredAt), "dd/MM/yyyy · HH:mm")}
                      {symptom.durationMinutes ? ` · ${symptom.durationMinutes} min` : ""}
                    </p>
                    {linked ? (
                      <Link
                        to="/conditions/$conditionId"
                        params={{ conditionId: symptom.conditionId as string }}
                        className="mt-1 inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary"
                      >
                        {linked}
                      </Link>
                    ) : null}
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
              );
            })}
          </ul>
        </Panel>
      )}

      <SymptomFormDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        defaultConditionId={filter !== "all" && filter !== "unlinked" ? filter : null}
      />
      <SymptomFormDialog
        open={!!editing}
        onOpenChange={(next) => (next ? null : setEditing(null))}
        symptom={editing}
      />
    </div>
  );
}
