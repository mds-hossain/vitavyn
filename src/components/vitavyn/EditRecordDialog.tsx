import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type EditField = {
  key: string;
  label: string;
  type?: "text" | "number" | "textarea" | "datetime-local" | "date" | "select";
  options?: string[];
  full?: boolean;
};

/** Generic edit sheet for simple records: seeded from `values` each time it opens. */
export function EditRecordDialog({
  title,
  open,
  onOpenChange,
  fields,
  values,
  onSave,
}: {
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fields: EditField[];
  values: Record<string, string>;
  onSave: (next: Record<string, string>) => void;
}) {
  const [draft, setDraft] = useState<Record<string, string>>(values);

  useEffect(() => {
    if (open) setDraft(values);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const set = (key: string, value: string) => setDraft((prev) => ({ ...prev, [key]: value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map((field) => (
            <div
              key={field.key}
              className={`space-y-1.5 ${field.full || field.type === "textarea" ? "sm:col-span-2" : ""}`}
            >
              <Label>{field.label}</Label>
              {field.type === "textarea" ? (
                <Textarea value={draft[field.key] ?? ""} onChange={(e) => set(field.key, e.target.value)} />
              ) : field.type === "select" ? (
                <Select value={draft[field.key] ?? ""} onValueChange={(v) => set(field.key, v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(field.options ?? []).map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  type={field.type ?? "text"}
                  value={draft[field.key] ?? ""}
                  onChange={(e) => set(field.key, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button
            onClick={() => {
              onSave(draft);
              onOpenChange(false);
            }}
          >
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
