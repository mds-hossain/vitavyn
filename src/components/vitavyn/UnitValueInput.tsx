import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  canonicalUnit,
  findUnit,
  round,
  toCanonicalValue,
  unitsFor,
} from "@/lib/vitavyn/units";

/**
 * Value + unit entry. The user may always enter in ANY unit supported by the
 * measurement kind; the display preference only decides the default selection.
 */
export function UnitValueInput({
  kind,
  label = "Value",
  value,
  unit,
  onValueChange,
  onUnitChange,
  big = false,
}: {
  kind: string;
  label?: string;
  value: string;
  unit: string;
  onValueChange: (v: string) => void;
  onUnitChange: (u: string) => void;
  big?: boolean;
}) {
  const options = unitsFor(kind);
  const canonical = canonicalUnit(kind);
  const numeric = Number(value);
  const showConversion =
    value !== "" && Number.isFinite(numeric) && unit !== canonical && !!findUnit(kind, unit);

  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</Label>
      <div className="flex gap-2">
        <Input
          type="number"
          inputMode="decimal"
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          className={big ? "metric-value h-14 text-2xl" : ""}
        />
        {options.length > 1 ? (
          <Select value={unit} onValueChange={onUnitChange}>
            <SelectTrigger className={big ? "h-14 w-32" : "w-32"} aria-label="Unit">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.map((u) => (
                <SelectItem key={u.value} value={u.value}>
                  {u.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : options.length === 1 ? (
          <div className="flex w-32 items-center rounded-md border border-border px-3 text-sm text-muted-foreground">
            {options[0]!.label}
          </div>
        ) : (
          <Input
            value={unit}
            onChange={(e) => onUnitChange(e.target.value)}
            placeholder="Unit"
            className={big ? "h-14 w-32" : "w-32"}
            aria-label="Unit"
          />
        )}
      </div>
      {showConversion ? (
        <p className="text-xs text-muted-foreground">
          Stored as {round(toCanonicalValue(kind, unit, numeric), 2)} {canonical}
        </p>
      ) : null}
    </div>
  );
}
