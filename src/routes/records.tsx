import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { format } from "date-fns";
import { FileText, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState, PageHeader, Panel, SafetyNote, StatusPill } from "@/components/vitavyn/primitives";
import { useVitavyn } from "@/lib/vitavyn/store";

export const Route = createFileRoute("/records")({
  head: () => ({
    meta: [
      { title: "Medical records — Vitavyn" },
      {
        name: "description",
        content: "Prescriptions, discharge summaries, scans and reports organised by category and date.",
      },
      { property: "og:title", content: "Medical records — Vitavyn" },
      { property: "og:description", content: "Your documents, organised and searchable." },
    ],
  }),
  component: RecordsPage,
});

const CATEGORIES = ["All", "Prescription", "Lab report", "Imaging", "Discharge summary", "Insurance", "Other"];

function RecordsPage() {
  const { data, add, remove } = useVitavyn();
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", category: "Prescription", issuedBy: "", fileName: "" });

  const rows = data.records.filter(
    (r) =>
      (category === "All" || r.category === category) &&
      r.title.toLowerCase().includes(query.toLowerCase()),
  );

  const save = () => {
    if (!form.title.trim()) {
      toast.error("Give the record a title");
      return;
    }
    add("records", {
      ...form,
      title: form.title.trim(),
      issuedOn: new Date().toISOString(),
      sizeKb: 240,
    } as never);
    setForm({ title: "", category: "Prescription", issuedBy: "", fileName: "" });
    setOpen(false);
    toast.success("Record saved");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Medical records"
        description="Everything that usually lives in a plastic folder — kept on your device."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> Add record
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search records"
          className="sm:max-w-xs"
        />
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                category === c ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState title="No records here" description="Add a document to keep it with the rest of your history." />
      ) : (
        <Panel>
          <ul className="divide-y divide-border">
            {rows.map((record) => (
              <li key={record.id} className="flex items-center justify-between gap-3 py-3">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{record.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {record.issuedBy ? `${record.issuedBy} · ` : ""}
                      {record.issuedOn ? format(new Date(record.issuedOn), "MMM d, yyyy") : ""}
                      {record.sizeKb ? ` · ${record.sizeKb} KB` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusPill tone="neutral">{record.category}</StatusPill>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Remove ${record.title}`}
                    onClick={() => remove("records", record.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      <SafetyNote>
        On the free Local plan, documents stay on this device only. Upgrade to Sync or Vault for encrypted backup.
      </SafetyNote>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add record</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Issued by</Label>
              <Input value={form.issuedBy} onChange={(e) => setForm({ ...form, issuedBy: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={save}>Save record</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
