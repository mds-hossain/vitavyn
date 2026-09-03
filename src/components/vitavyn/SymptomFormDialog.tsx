import { useEffect, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/vitavyn/DatePicker";
import { TimePicker } from "@/components/vitavyn/TimePicker";
import { useVitavyn } from "@/lib/vitavyn/store";
import type { Symptom } from "@/lib/vitavyn/types";

const NONE = "none";

/**
 * Unified add/edit dialog for symptoms. Captures severity, when it happened,
 * duration, the condition it relates to, and free-text notes.
 */
export function SymptomFormDialog({
  open,
  onOpenChange,
  symptom,
  defaultConditionId,
}: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  symptom?: Symptom | null;
  defaultConditionId?: string | null;
}) {
  const { data, add, updateItem } = useVitavyn();
  const [name, setName] = useState("");
  const [severity, setSeverity] = useState("3");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("08:00");
  const [duration, setDuration] = useState("");
  const [conditionId, setConditionId] = useState<string>(NONE);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!open) return;
    const when = symptom ? new Date(symptom.occurredAt) : new Date();
    setName(symptom?.name ?? "");
    setSeverity(String(symptom?.severity ?? 3));
    setDate(format(when, "yyyy-MM-dd"));
    setTime(format(when, "HH:mm"));
    setDuration(symptom?.durationMinutes ? String(symptom.durationMinutes) : "");
    setConditionId(symptom?.conditionId ?? defaultConditionId ?? NONE);
    setNotes(symptom?.notes ?? "");
  }, [open, symptom, defaultConditionId]);

  const save = () => {
    if (!name.trim()) {
      toast.error("Name the symptom");
      return;
    }
    const [h, m] = time.split(":").map((n) => Number(n));
    const occurred = date ? new Date(`${date}T00:00:00`) : new Date();
    occurred.setHours(Number.isFinite(h) ? (h as number) : 0, Number.isFinite(m) ? (m as number) : 0, 0, 0);

    const payload = {
      name: name.trim(),
      severity: Number(severity),
      occurredAt: occurred.toISOString(),
      durationMinutes: duration ? Number(duration) : null,
      conditionId: conditionId === NONE ? null : conditionId,
      notes: notes.trim(),
    };

    if (symptom) {
      updateItem("symptoms", symptom.id, payload as never);
      toast.success("Symptom updated");
    } else {
      add("symptoms", payload as never);
      toast.success("Symptom logged");
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{symptom ? "Edit symptom" : "Log symptom"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Symptom</Label>
              <Input
                value={name}
                placeholder="e.g. Headache"
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Severity (1–5)</Label>
              <Select value={severity} onValueChange={setSeverity}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Duration (minutes)</Label>
              <Input
                type="number"
                min={0}
                value={duration}
                placeholder="Optional"
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Date</Label>
              <DatePicker value={date} onChange={setDate} label="Symptom date" />
            </div>

            <div className="space-y-1.5">
              <Label>Time</Label>
              <TimePicker value={time} onChange={setTime} label="Symptom time" className="w-full" />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label>Related condition</Label>
              <Select value={conditionId} onValueChange={setConditionId}>
                <SelectTrigger>
                  <SelectValue placeholder="Not linked" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>Not linked</SelectItem>
                  {data.conditions.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label>Notes</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={save}>{symptom ? "Save changes" : "Log symptom"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
