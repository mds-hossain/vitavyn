import { useState } from "react";
import { Clock } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatTimeOfDay } from "@/lib/vitavyn/medication";
import { useVitavyn } from "@/lib/vitavyn/store";

/** Hours allowed inside a clinical window, wrapping past midnight when needed. */
function hoursIn(minHour: number, maxHour: number): number[] {
  const out: number[] = [];
  if (minHour <= maxHour) {
    for (let h = minHour; h <= maxHour; h += 1) out.push(h);
  } else {
    for (let h = minHour; h <= 23; h += 1) out.push(h);
    for (let h = 0; h <= maxHour; h += 1) out.push(h);
  }
  return out;
}

const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

/**
 * Custom (non-native) time picker. Selection is bounded to the clinical window
 * passed in, and the trigger renders in the user's 12h/24h preference.
 */
export function TimePicker({
  value,
  onChange,
  min = "00:00",
  max = "23:59",
  label,
  className = "",
}: {
  value: string;
  onChange: (next: string) => void;
  min?: string;
  max?: string;
  label?: string;
  className?: string;
}) {
  const { data } = useVitavyn();
  const [open, setOpen] = useState(false);
  const twelveHour = data.preferences.timeFormat === "12h";

  const minHour = Number(min.split(":")[0] ?? 0);
  const maxHour = Number(max.split(":")[0] ?? 23);
  const hours = hoursIn(minHour, maxHour);

  const [vh, vm] = value.split(":").map((n) => Number(n));
  const hour = Number.isFinite(vh) ? (vh as number) : (hours[0] ?? 0);
  const minute = Number.isFinite(vm) ? (vm as number) : 0;

  const commit = (h: number, m: number) =>
    onChange(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);

  const hourLabel = (h: number) =>
    twelveHour ? `${((h + 11) % 12) + 1} ${h < 12 ? "AM" : "PM"}` : String(h).padStart(2, "0");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        type="button"
        aria-label={label ?? "Select time"}
        className={`inline-flex h-9 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm font-medium tabular-nums transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${className}`}
      >
        <Clock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" strokeWidth={1.75} />
        {formatTimeOfDay(value, twelveHour)}
      </PopoverTrigger>
      <PopoverContent align="start" className="pointer-events-auto w-auto p-2">
        <div className="flex gap-2">
          <div className="max-h-56 w-24 overflow-y-auto pr-1">
            <p className="px-2 pb-1 text-[10px] uppercase tracking-wide text-muted-foreground">
              Hour
            </p>
            {hours.map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => commit(h, minute)}
                className={`block w-full rounded-md px-2 py-1.5 text-left text-sm tabular-nums transition-colors ${
                  h === hour ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
              >
                {hourLabel(h)}
              </button>
            ))}
          </div>
          <div className="max-h-56 w-20 overflow-y-auto">
            <p className="px-2 pb-1 text-[10px] uppercase tracking-wide text-muted-foreground">
              Minute
            </p>
            {MINUTES.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  commit(hour, m);
                  setOpen(false);
                }}
                className={`block w-full rounded-md px-2 py-1.5 text-left text-sm tabular-nums transition-colors ${
                  m === minute ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
              >
                {String(m).padStart(2, "0")}
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
