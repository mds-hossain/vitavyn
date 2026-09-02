import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MEAL_CONTEXTS } from "@/lib/vitavyn/medication";
import type { DoseSlot, MealContext, SlotId } from "@/lib/vitavyn/types";

export const SLOTS: { id: SlotId; label: string; defaultTime: string }[] = [
  { id: "morning", label: "Morning", defaultTime: "08:00" },
  { id: "noon", label: "Noon", defaultTime: "13:00" },
  { id: "evening", label: "Evening", defaultTime: "18:00" },
  { id: "night", label: "Night", defaultTime: "22:00" },
];

export const slotLabel = (id: SlotId) =>
  SLOTS.find((s) => s.id === id)?.label ?? (id === "custom" ? "Custom" : id);

export function sortSchedule(schedule: DoseSlot[]): DoseSlot[] {
  return [...schedule].sort((a, b) => a.time.localeCompare(b.time));
}

/**
 * Inline dose schedule: four time-of-day blocks that expand in place, plus
 * custom dose times for more complex regimens.
 */
export function DoseScheduleField({
  schedule,
  onChange,
}: {
  schedule: DoseSlot[];
  onChange: (next: DoseSlot[]) => void;
}) {
  const update = (index: number, patch: Partial<DoseSlot>) =>
    onChange(schedule.map((s, i) => (i === index ? { ...s, ...patch } : s)));

  const removeAt = (index: number) => onChange(schedule.filter((_, i) => i !== index));

  const toggleSlot = (slot: SlotId, defaultTime: string) => {
    const index = schedule.findIndex((s) => s.slot === slot);
    if (index >= 0) removeAt(index);
    else onChange(sortSchedule([...schedule, { slot, time: defaultTime, mealContext: "anytime" }]));
  };

  const addCustom = () =>
    onChange(sortSchedule([...schedule, { slot: "custom", time: "12:00", mealContext: "anytime" }]));

  const rows = schedule
    .map((dose, index) => ({ dose, index }))
    .sort((a, b) => a.dose.time.localeCompare(b.dose.time));

  return (
    <div className="space-y-3">
      <Label className="text-xs uppercase tracking-wide text-muted-foreground">
        When do you take it?
      </Label>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {SLOTS.map((slot) => {
          const picked = schedule.find((s) => s.slot === slot.id);
          return (
            <button
              key={slot.id}
              type="button"
              aria-pressed={!!picked}
              onClick={() => toggleSlot(slot.id, slot.defaultTime)}
              className={`rounded-xl border px-3 py-3 text-center text-sm font-medium transition-colors ${
                picked
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary"
              }`}
            >
              {slot.label}
            </button>
          );
        })}
      </div>

      {rows.length > 0 ? (
        <div className="space-y-2">
          {rows.map(({ dose, index }) => (
            <div
              key={`${dose.slot}-${index}`}
              className="rounded-xl border border-border bg-muted/30 p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-muted-foreground">{slotLabel(dose.slot)}</p>
                <button
                  type="button"
                  aria-label={`Remove ${slotLabel(dose.slot).toLowerCase()} dose`}
                  onClick={() => removeAt(index)}
                  className="rounded-md p-1 text-muted-foreground transition-colors hover:text-destructive"
                >
                  <X className="h-4 w-4" strokeWidth={1.75} />
                </button>
              </div>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <Input
                  type="time"
                  value={dose.time}
                  aria-label={`${slotLabel(dose.slot)} time`}
                  onChange={(e) => update(index, { time: e.target.value })}
                />
                <Select
                  value={dose.mealContext ?? "anytime"}
                  onValueChange={(v) => update(index, { mealContext: v as MealContext })}
                >
                  <SelectTrigger aria-label={`${slotLabel(dose.slot)} meal context`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MEAL_CONTEXTS.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <button
        type="button"
        onClick={addCustom}
        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
      >
        <Plus className="h-4 w-4" strokeWidth={1.75} /> Add custom dose time
      </button>
    </div>
  );
}
