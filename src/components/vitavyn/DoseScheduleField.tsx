import { Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { DoseSlot, SlotId } from "@/lib/vitavyn/types";

export const SLOTS: { id: SlotId; label: string; defaultTime: string }[] = [
  { id: "morning", label: "Morning", defaultTime: "08:00" },
  { id: "noon", label: "Noon", defaultTime: "13:00" },
  { id: "evening", label: "Evening", defaultTime: "18:00" },
  { id: "night", label: "Night", defaultTime: "22:00" },
];

export const slotLabel = (id: SlotId) => SLOTS.find((s) => s.id === id)?.label ?? id;

export function sortSchedule(schedule: DoseSlot[]): DoseSlot[] {
  const order = SLOTS.map((s) => s.id);
  return [...schedule].sort((a, b) => order.indexOf(a.slot) - order.indexOf(b.slot));
}

/**
 * Pick which parts of the day a medication is taken, then set the exact time
 * for each selected part with a time picker.
 */
export function DoseScheduleField({
  schedule,
  onChange,
}: {
  schedule: DoseSlot[];
  onChange: (next: DoseSlot[]) => void;
}) {
  const toggle = (slot: SlotId, defaultTime: string) => {
    const exists = schedule.some((s) => s.slot === slot);
    onChange(
      exists
        ? schedule.filter((s) => s.slot !== slot)
        : sortSchedule([...schedule, { slot, time: defaultTime }]),
    );
  };

  const setTime = (slot: SlotId, time: string) =>
    onChange(schedule.map((s) => (s.slot === slot ? { ...s, time } : s)));

  return (
    <div className="space-y-3">
      <Label className="text-xs uppercase tracking-wide text-muted-foreground">
        When do you take it?
      </Label>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {SLOTS.map((slot) => {
          const picked = schedule.find((s) => s.slot === slot.id);
          return (
            <Popover key={slot.id}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  aria-pressed={!!picked}
                  onClick={() => {
                    if (!picked) toggle(slot.id, slot.defaultTime);
                  }}
                  className={`rounded-xl border px-3 py-3 text-center text-sm font-medium transition-colors ${
                    picked
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary"
                  }`}
                >
                  <span className="block">{slot.label}</span>
                  <span className="mt-1 flex items-center justify-center gap-1 text-xs">
                    <Clock className="h-3 w-3" />
                    {picked ? picked.time : "off"}
                  </span>
                </button>
              </PopoverTrigger>
              {picked ? (
                <PopoverContent className="w-56 space-y-3">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                    {slot.label} time
                  </Label>
                  <Input
                    type="time"
                    value={picked.time}
                    onChange={(e) => setTime(slot.id, e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => toggle(slot.id, slot.defaultTime)}
                    className="text-xs text-muted-foreground underline"
                  >
                    Remove {slot.label.toLowerCase()} dose
                  </button>
                </PopoverContent>
              ) : null}
            </Popover>
          );
        })}
      </div>
    </div>
  );
}
