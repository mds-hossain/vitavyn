import { useEffect, useMemo, useState } from "react";
import { Check, Plus, X } from "lucide-react";
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
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "./DatePicker";
import { CONDITION_NAMES, UNIVERSAL_METRICS, metricsForCondition } from "@/lib/vitavyn/conditionSeed";
import type { Condition, CustomMetric } from "@/lib/vitavyn/types";

export type ConditionFormValues = {
  name: string;
  status: Condition["status"];
  diagnosedOn: string;
  trackedMetrics: string[];
  notes: string;
};

const EMPTY: ConditionFormValues = {
  name: "",
  status: "active",
  diagnosedOn: "",
  trackedMetrics: [],
  notes: "",
};

export function ConditionFormDialog({
  open,
  onOpenChange,
  mode,
  initial,
  customMetrics,
  onCreateCustomMetric,
  onSave,
}: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  mode: "add" | "edit";
  initial?: ConditionFormValues | undefined;
  customMetrics: CustomMetric[];
  onCreateCustomMetric: (metric: Omit<CustomMetric, "id" | "createdAt" | "updatedAt">) => void;
  onSave: (values: ConditionFormValues) => void;
}) {
  const [values, setValues] = useState<ConditionFormValues>(initial ?? EMPTY);
  const [nameOpen, setNameOpen] = useState(false);
  const [metricsOpen, setMetricsOpen] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [autoFilledFor, setAutoFilledFor] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setValues(initial ?? EMPTY);
      setAutoFilledFor(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const set = <K extends keyof ConditionFormValues>(key: K, value: ConditionFormValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  const suggestions = useMemo(() => {
    const q = values.name.trim().toLowerCase();
    if (!q) return CONDITION_NAMES.slice(0, 8);
    return CONDITION_NAMES.filter((c) => c.toLowerCase().includes(q)).slice(0, 8);
  }, [values.name]);

  const metricOptions = useMemo(
    () => [...new Set([...UNIVERSAL_METRICS, ...customMetrics.map((m) => m.name)])].sort(),
    [customMetrics],
  );

  /** Apply the seed dictionary when the typed name matches a known condition. */
  const applySeed = (name: string) => {
    const mapped = metricsForCondition(name);
    if (mapped.length === 0) return;
    if (autoFilledFor === name) return;
    setValues((v) => ({ ...v, name, trackedMetrics: [...new Set([...mapped])] }));
    setAutoFilledFor(name);
  };

  const toggleMetric = (metric: string) =>
    setValues((v) => ({
      ...v,
      trackedMetrics: v.trackedMetrics.includes(metric)
        ? v.trackedMetrics.filter((m) => m !== metric)
        : [...v.trackedMetrics, metric],
    }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Add condition" : "Edit condition"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Row 1 — smart autocomplete name */}
          <div className="space-y-1.5">
            <Label>Condition name</Label>
            <Popover open={nameOpen && suggestions.length > 0} onOpenChange={setNameOpen}>
              <PopoverAnchor asChild>
                <Input
                  value={values.name}
                  placeholder="Start typing, e.g. Hypertension"
                  autoComplete="off"
                  onChange={(e) => {
                    set("name", e.target.value);
                    setNameOpen(true);
                    applySeed(e.target.value);
                  }}
                  onFocus={() => setNameOpen(true)}
                />
              </PopoverAnchor>
              <PopoverContent
                align="start"
                className="w-[--radix-popover-trigger-width] p-1"
                onOpenAutoFocus={(e) => e.preventDefault()}
              >
                <ul className="max-h-56 overflow-y-auto">
                  {suggestions.map((s) => (
                    <li key={s}>
                      <button
                        type="button"
                        className="w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
                        onClick={() => {
                          setValues((v) => ({
                            ...v,
                            name: s,
                            trackedMetrics: [...new Set([...metricsForCondition(s)])],
                          }));
                          setAutoFilledFor(s);
                          setNameOpen(false);
                        }}
                      >
                        {s}
                      </button>
                    </li>
                  ))}
                </ul>
              </PopoverContent>
            </Popover>
            <p className="text-xs text-muted-foreground">
              Any condition works. Known conditions pre-fill their usual metrics.
            </p>
          </div>

          {/* Row 2 — status + diagnosed on */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={values.status}
                onValueChange={(v) => set("status", v as Condition["status"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="monitoring">Monitoring</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Diagnosed on</Label>
              <DatePicker
                value={values.diagnosedOn}
                onChange={(next) => set("diagnosedOn", next)}
                label="Diagnosed on"
              />
            </div>
          </div>

          {/* Row 3 — tracked metrics as chips */}
          <div className="space-y-1.5">
            <Label>Tracked metrics</Label>
            <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-background p-2">
              {values.trackedMetrics.map((metric) => (
                <span
                  key={metric}
                  className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground"
                >
                  {metric}
                  <button
                    type="button"
                    aria-label={`Remove ${metric}`}
                    onClick={() => toggleMetric(metric)}
                    className="rounded-full p-0.5 hover:bg-background/60"
                  >
                    <X className="h-3 w-3" strokeWidth={2} />
                  </button>
                </span>
              ))}
              <Popover open={metricsOpen} onOpenChange={setMetricsOpen}>
                <PopoverTrigger asChild>
                  <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs">
                    <Plus className="h-3.5 w-3.5" strokeWidth={1.75} /> Add metric
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-72 p-1">
                  <ul className="max-h-60 overflow-y-auto">
                    {metricOptions.map((metric) => {
                      const selected = values.trackedMetrics.includes(metric);
                      return (
                        <li key={metric}>
                          <button
                            type="button"
                            className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
                            onClick={() => toggleMetric(metric)}
                          >
                            {metric}
                            {selected ? <Check className="h-4 w-4 text-primary" strokeWidth={2} /> : null}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                  <div className="mt-1 border-t border-border pt-1">
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm font-medium text-primary hover:bg-muted"
                      onClick={() => {
                        setMetricsOpen(false);
                        setCustomOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4" strokeWidth={1.75} /> Create custom measurement
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Row 4 — notes */}
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea
              value={values.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Anything you want to remember about this condition"
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onSave(values)}>
            {mode === "add" ? "Save condition" : "Save changes"}
          </Button>
        </DialogFooter>

        <CustomMetricDialog
          open={customOpen}
          onOpenChange={setCustomOpen}
          onCreate={(metric) => {
            onCreateCustomMetric(metric);
            setValues((v) => ({
              ...v,
              trackedMetrics: [...new Set([...v.trackedMetrics, metricLabel(metric)])],
            }));
            setCustomOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

function metricLabel(metric: { name: string; unit?: string }) {
  return metric.unit ? `${metric.name} (${metric.unit})` : metric.name;
}

function CustomMetricDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  onCreate: (metric: Omit<CustomMetric, "id" | "createdAt" | "updatedAt">) => void;
}) {
  const [name, setName] = useState("");
  const [inputFormat, setInputFormat] = useState<CustomMetric["inputFormat"]>("numeric");
  const [unit, setUnit] = useState("");

  useEffect(() => {
    if (open) {
      setName("");
      setInputFormat("numeric");
      setUnit("");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Create custom measurement</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Measurement name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Morning stiffness" />
          </div>
          <div className="space-y-1.5">
            <Label>Input format</Label>
            <Select
              value={inputFormat}
              onValueChange={(v) => setInputFormat(v as CustomMetric["inputFormat"])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="numeric">Numeric value</SelectItem>
                <SelectItem value="scale_1_10">1-10 Scale</SelectItem>
                <SelectItem value="yes_no">Yes / No</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Unit (optional)</Label>
            <Input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="mg/dL" />
          </div>
        </div>
        <DialogFooter>
          <Button
            disabled={!name.trim()}
            onClick={() =>
              onCreate({
                name: name.trim(),
                inputFormat,
                ...(unit.trim() ? { unit: unit.trim() } : {}),
              })
            }
          >
            Save measurement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
