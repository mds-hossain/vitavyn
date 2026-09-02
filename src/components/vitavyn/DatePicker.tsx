import { useState } from "react";
import { format, parse, isValid } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

/** Custom date picker. Stores ISO `yyyy-MM-dd`, always displays DD/MM/YYYY. */
export function DatePicker({
  value,
  onChange,
  placeholder = "DD/MM/YYYY",
  label,
}: {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const parsed = value ? parse(value, "yyyy-MM-dd", new Date()) : undefined;
  const selected = parsed && isValid(parsed) ? parsed : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        type="button"
        aria-label={label ?? "Select date"}
        className={cn(
          "flex h-9 w-full items-center gap-2 rounded-md border border-border bg-background px-3 text-left text-sm transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          !selected && "text-muted-foreground",
        )}
      >
        <CalendarIcon className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
        {selected ? format(selected, "dd/MM/yyyy") : placeholder}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selected}
          {...(selected ? { defaultMonth: selected } : {})}
          onSelect={(date) => {
            onChange(date ? format(date, "yyyy-MM-dd") : "");
            setOpen(false);
          }}
          className={cn("pointer-events-auto p-3")}
        />
      </PopoverContent>
    </Popover>
  );
}
