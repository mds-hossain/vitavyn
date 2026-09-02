import { isPastMedication, slotForTime } from "./medication";
import type { MeasurementKind, SlotId, VitavynData } from "./types";

export const KIND_LABELS: Record<string, string> = {
  glucose: "Blood glucose",
  hba1c: "HbA1c",
  blood_pressure: "Blood pressure",
  weight: "Weight",
  heart_rate: "Heart rate",
  temperature: "Temperature",
  cholesterol: "Cholesterol",
  custom: "Other",
};

const CONDITION_KEYWORDS: { match: RegExp; kinds: MeasurementKind[] }[] = [
  { match: /diabet|glucose|sugar|a1c/i, kinds: ["glucose", "hba1c"] },
  { match: /hypertens|blood pressure|cardio|heart/i, kinds: ["blood_pressure", "heart_rate"] },
  { match: /cholesterol|lipid|ldl|hdl|triglycer/i, kinds: ["cholesterol"] },
  { match: /obes|weight|thyroid|bmi/i, kinds: ["weight"] },
];

/**
 * Measurement kinds worth showing this user, derived from their active conditions
 * (name + tracked metrics) and falling back to what they actually record.
 */
export function relevantKinds(data: VitavynData): MeasurementKind[] {
  const kinds = new Set<MeasurementKind>();

  for (const condition of data.conditions) {
    if (condition.status === "resolved") continue;
    const haystack = [condition.name, ...condition.trackedMetrics].join(" ");
    for (const rule of CONDITION_KEYWORDS) {
      if (rule.match.test(haystack)) rule.kinds.forEach((k) => kinds.add(k));
    }
  }

  if (kinds.size === 0) {
    for (const m of data.measurements.slice(0, 30)) kinds.add(m.kind);
  }

  // Weight is a broadly useful baseline once anything else is tracked.
  if (kinds.size > 0 && data.measurements.some((m) => m.kind === "weight")) kinds.add("weight");

  const available = new Set(data.measurements.map((m) => m.kind));
  const ordered = [...kinds].filter((k) => available.has(k));
  return ordered.length > 0 ? ordered.slice(0, 4) : ([...available].slice(0, 3) as MeasurementKind[]);
}

export function measurementsOfKind(data: VitavynData, kind: string) {
  return data.measurements
    .filter((m) => m.kind === kind)
    .sort((a, b) => new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime());
}

export type Dose = {
  medicationId: string;
  name: string;
  dose: string;
  unit: string;
  form: string;
  slot: SlotId;
  mealContext?: string | undefined;
  conditionName?: string | undefined;
  time: string;
  scheduled: Date;
  logId?: string | undefined;
  status: "recorded" | "skipped" | "pending";
};

/** Whether a medication's frequency rule puts it on the calendar for `now`. */
export function isScheduledToday(med: VitavynData["medications"][number], now: Date): boolean {
  if (med.frequency === "as_needed") return false;
  if (med.frequency === "specific_days") {
    const days = med.daysOfWeek ?? [];
    return days.length === 0 || days.includes(now.getDay());
  }
  if (med.frequency === "every_other_day") {
    const start = med.startDate ? new Date(med.startDate) : new Date(med.createdAt);
    if (Number.isNaN(start.getTime())) return true;
    const day = 86400000;
    const a = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
    const b = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.abs(Math.round((b - a) / day)) % 2 === 0;
  }
  return true;
}

/** Today's dose schedule with resolved status, shared by dashboard and medications page. */
export function todaysDoses(data: VitavynData, now = new Date()): Dose[] {
  const todayKey = now.toDateString();
  return data.medications
    .filter((med) => !isPastMedication(med, now) && isScheduledToday(med, now))
    .flatMap((med) => {
      const slots: { time: string; slot: SlotId; mealContext?: string }[] = med.schedule?.length
        ? med.schedule.map((s) => ({
            time: s.time,
            slot: s.slot,
            ...(s.mealContext ? { mealContext: s.mealContext } : {}),
          }))
        : (med.times ?? []).map((time) => ({ time, slot: slotForTime(time) }));
      const conditionName = data.conditions.find((c) => med.conditionIds?.includes(c.id))?.name;
      return slots.map((entry) => {
        const [h, m] = entry.time.split(":");
        const scheduled = new Date(now);
        scheduled.setHours(Number(h), Number(m ?? 0), 0, 0);
        const log = data.medicationLogs.find(
          (l) =>
            l.medicationId === med.id &&
            new Date(l.scheduledFor).toDateString() === todayKey &&
            Math.abs(new Date(l.scheduledFor).getHours() - Number(h)) <= 1,
        );
        return {
          medicationId: med.id,
          name: med.name,
          dose: med.dose,
          unit: med.unit,
          form: med.form,
          slot: entry.slot,
          mealContext: entry.mealContext,
          conditionName,
          time: entry.time,
          scheduled,
          logId: log?.id,
          status: (log?.status ?? "pending") as Dose["status"],
        };
      });
    })
    .sort((a, b) => a.scheduled.getTime() - b.scheduled.getTime());
}

export function doseState(dose: Dose, now = new Date()) {
  if (dose.status === "recorded") return "recorded" as const;
  if (dose.status === "skipped") return "not-taken" as const;
  const diff = dose.scheduled.getTime() - now.getTime();
  if (diff <= 30 * 60000) return "due" as const;
  return "upcoming" as const;
}
