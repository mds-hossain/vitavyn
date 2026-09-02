import { isPastMedication } from "./medication";
import type { MeasurementKind, VitavynData } from "./types";

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
  time: string;
  scheduled: Date;
  status: "recorded" | "skipped" | "pending";
};

/** Today's dose schedule with resolved status, shared by dashboard and medications page. */
export function todaysDoses(data: VitavynData, now = new Date()): Dose[] {
  const todayKey = now.toDateString();
  return data.medications
    .filter((med) => !isPastMedication(med, now))
    .flatMap((med) => {
      const times = med.schedule?.length ? med.schedule.map((s) => s.time) : med.times;
      return times.map((time) => {
        const [h, m] = time.split(":");
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
          time,
          scheduled,
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
