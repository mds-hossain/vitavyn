import { Moon, Sun, Sunrise, Sunset, X, type LucideIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
 * Bounded clinical schedule: four time-of-day blocks that expand inline, each
 * with a time picker clamped to its clinical window and a meal-context select.
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

  const toggleSlot = (slot: SlotId, defaultTime: string) => {
    if (bySlot(slot)) removeSlot(slot);
    else onChange(sortSchedule([...schedule, { slot, time: defaultTime, mealContext: "anytime" }]));
  };

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-sm font-medium">When do you take it?</Label>
        <p className="text-xs text-muted-foreground">
          Tap a block to set its exact time and meal context.
        </p>
      </div>

      <div className="space-y-2">
        {SLOTS.map((slot) => {
          const picked = bySlot(slot.id);
          const win = SLOT_WINDOWS[slot.id as Exclude<SlotId, "custom">]!;
          const Icon = slot.icon;
          return (
            <div
              key={slot.id}
              className={`overflow-hidden rounded-xl border transition-colors ${
                picked ? "border-primary/60 bg-primary/5" : "border-border"
              }`}
            >
              <button
                type="button"
                aria-pressed={!!picked}
                onClick={() => toggleSlot(slot.id, slot.defaultTime)}
                className="flex w-full items-center gap-3 px-3 py-3 text-left"
              >
                <Icon
                  className={`h-4 w-4 shrink-0 ${picked ? "text-primary" : "text-muted-foreground"}`}
                  strokeWidth={1.75}
                />
                <span className={`text-sm font-medium ${picked ? "text-primary" : ""}`}>
                  {slot.label}
                </span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {picked ? picked.time : `${win.min}–${win.max}`}
                </span>
              </button>

              {picked ? (
                <div className="grid gap-2 border-t border-border/60 px-3 py-3 sm:grid-cols-[1fr_1fr_auto]">
                  <Input
                    type="time"
                    value={picked.time}
                    min={win.wraps ? undefined : win.min}
                    max={win.wraps ? undefined : win.max}
                    aria-label={`${slot.label} time`}
                    onChange={(e) => update(slot.id, { time: e.target.value })}
                    onBlur={(e) => update(slot.id, { time: clampToSlot(slot.id, e.target.value) })}
                  />
                  <Select
                    value={picked.mealContext ?? "anytime"}
                    onValueChange={(v) => update(slot.id, { mealContext: v as MealContext })}
                  >
                    <SelectTrigger aria-label={`${slot.label} meal context`}>
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
                    className="inline-flex h-9 w-9 items-center justify-center justify-self-end rounded-md text-muted-foreground transition-colors hover:text-destructive"
                  >
                    <X className="h-4 w-4" strokeWidth={1.75} />
                  </button>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
