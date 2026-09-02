import { Moon, Plus, Sun, Sunrise, Sunset, X, type LucideIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TimePicker } from "@/components/vitavyn/TimePicker";
import { MEAL_CONTEXTS, SLOT_WINDOWS, clampToSlot } from "@/lib/vitavyn/medication";
import type { DoseSlot, MealContext, SlotId } from "@/lib/vitavyn/types";

export const SLOTS: { id: SlotId; label: string; defaultTime: string; icon: LucideIcon }[] = [
  { id: "morning", label: "Morning", defaultTime: SLOT_WINDOWS.morning.defaultTime, icon: Sunrise },
  { id: "noon", label: "Noon", defaultTime: SLOT_WINDOWS.noon.defaultTime, icon: Sun },
  { id: "evening", label: "Evening", defaultTime: SLOT_WINDOWS.evening.defaultTime, icon: Sunset },
  { id: "night", label: "Night", defaultTime: SLOT_WINDOWS.night.defaultTime, icon: Moon },
];

export const slotLabel = (id: SlotId) => SLOTS.find((s) => s.id === id)?.label ?? "Dose";

export const slotIcon = (id: SlotId): LucideIcon =>
  SLOTS.find((s) => s.id === id)?.icon ?? Sun;

export function sortSchedule(schedule: DoseSlot[]): DoseSlot[] {
  const order: SlotId[] = ["morning", "noon", "evening", "night", "custom"];
  return [...schedule].sort(
    (a, b) => order.indexOf(a.slot) - order.indexOf(b.slot) || a.time.localeCompare(b.time),
  );
}

/**
 * Bounded clinical schedule: four time-of-day blocks. Inactive blocks read as
 * "add" affordances; active blocks are one horizontal row on every breakpoint.
 */
export function DoseScheduleField({
  schedule,
  onChange,
}: {
  schedule: DoseSlot[];
  onChange: (next: DoseSlot[]) => void;
}) {
  const bySlot = (slot: SlotId) => schedule.find((s) => s.slot === slot);

  const update = (slot: SlotId, patch: Partial<DoseSlot>) =>
    onChange(schedule.map((s) => (s.slot === slot ? { ...s, ...patch } : s)));

  const removeSlot = (slot: SlotId) => onChange(schedule.filter((s) => s.slot !== slot));

  const addSlot = (slot: SlotId, defaultTime: string) =>
    onChange(sortSchedule([...schedule, { slot, time: defaultTime, mealContext: "anytime" }]));

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-sm font-medium">When do you take it?</Label>
        <p className="text-xs text-muted-foreground">
          Each block keeps its time inside the usual clinical window.
        </p>
      </div>

      <div className="space-y-2">
        {SLOTS.map((slot) => {
          const picked = bySlot(slot.id);
          const win = SLOT_WINDOWS[slot.id as Exclude<SlotId, "custom">]!;
          const Icon = slot.icon;

          if (!picked) {
            return (
              <button
                key={slot.id}
                type="button"
                onClick={() => addSlot(slot.id, slot.defaultTime)}
                className="flex w-full items-center gap-2 rounded-xl border border-dashed border-border bg-muted/30 px-3 py-2.5 text-left text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
              >
                <Plus className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                <span className="min-w-0 truncate">
                  Add {slot.label} dose ({win.min} to {win.max})
                </span>
              </button>
            );
          }

          return (
            <div
              key={slot.id}
              className="flex flex-row items-center justify-between gap-2 rounded-xl border border-primary/60 bg-primary/5 px-2.5 py-2"
            >
              <span className="flex min-w-0 shrink items-center gap-1.5 text-sm font-medium text-primary">
                <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                <span className="truncate">{slot.label}</span>
              </span>

              <TimePicker
                value={picked.time}
                label={`${slot.label} time`}
                min={win.min}
                max={win.max}
                onChange={(time) => update(slot.id, { time: clampToSlot(slot.id, time) })}
                className="shrink-0"
              />

              <Select
                value={picked.mealContext ?? "anytime"}
                onValueChange={(v) => update(slot.id, { mealContext: v as MealContext })}
              >
                <SelectTrigger
                  aria-label={`${slot.label} meal context`}
                  className="h-9 w-[7.5rem] shrink-0 text-xs sm:w-36 sm:text-sm"
                >
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

              <button
                type="button"
                aria-label={`Remove ${slot.label.toLowerCase()} dose`}
                onClick={() => removeSlot(slot.id)}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-destructive"
              >
                <X className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
