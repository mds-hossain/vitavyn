import {
  Bandage,
  Droplet,
  Droplets,
  Pill,
  Pipette,
  Syringe,
  Wind,
  type LucideIcon,
} from "lucide-react";
import type { Medication, SlotId } from "./types";

export type MedFormDef = {
  value: string;
  label: string;
  icon: LucideIcon;
  units: string[];
};

/** Medication forms with their allowed measurement units. */
export const MED_FORMS: MedFormDef[] = [
  { value: "tablet", label: "Tablet", icon: Pill, units: ["mg", "mcg", "g"] },
  { value: "capsule", label: "Capsule", icon: Pill, units: ["mg", "mcg", "g"] },
  { value: "liquid", label: "Liquid / Syrup", icon: Droplet, units: ["mL"] },
  { value: "insulin", label: "Insulin", icon: Syringe, units: ["IU"] },
  { value: "injection", label: "Injection / Pen", icon: Syringe, units: ["mg", "mcg", "mL", "IU"] },
  { value: "inhaler", label: "Inhaler / Puff", icon: Wind, units: ["Puffs"] },
  { value: "cream", label: "Cream", icon: Pipette, units: ["mg", "g"] },
  { value: "ointment", label: "Ointment", icon: Pipette, units: ["mg", "g"] },
  { value: "drops", label: "Drops (Eye / Ear)", icon: Droplet, units: ["Drops"] },
  { value: "patch", label: "Patch", icon: Bandage, units: ["mcg", "mg"] },
];

/** Legacy stored form values from earlier versions of the app. */
const FORM_ALIASES: Record<string, string> = {
  insulin_pen: "insulin",
  insulin_vial: "insulin",
  pill: "tablet",
  Tablet: "tablet",
};

export const normalizeForm = (value: string) =>
  MED_FORMS.some((f) => f.value === value) ? value : (FORM_ALIASES[value] ?? "tablet");

export const findMedForm = (value: string) =>
  MED_FORMS.find((f) => f.value === normalizeForm(value)) ?? MED_FORMS[0]!;

/** Clinical windows each time-of-day block is clamped to. */
export const SLOT_WINDOWS: Record<
  Exclude<SlotId, "custom">,
  { label: string; min: string; max: string; defaultTime: string; wraps?: boolean }
> = {
  morning: { label: "Morning", min: "06:00", max: "11:59", defaultTime: "08:00" },
  noon: { label: "Noon", min: "12:00", max: "16:59", defaultTime: "13:00" },
  evening: { label: "Evening", min: "17:00", max: "20:59", defaultTime: "18:00" },
  night: { label: "Night", min: "21:00", max: "05:59", defaultTime: "22:00", wraps: true },
};

const toMinutes = (t: string) => {
  const [h, m] = t.split(":");
  return Number(h ?? 0) * 60 + Number(m ?? 0);
};

/** Keep a chosen time inside its slot's clinical window (night wraps past midnight). */
export function clampToSlot(slot: SlotId, time: string): string {
  const win = SLOT_WINDOWS[slot as Exclude<SlotId, "custom">];
  if (!win) return time;
  const v = toMinutes(time);
  const min = toMinutes(win.min);
  const max = toMinutes(win.max);
  if (win.wraps) return v >= min || v <= max ? time : win.defaultTime;
  if (v < min) return win.min;
  if (v > max) return win.max;
  return time;
}

export function slotForTime(time: string): SlotId {
  const v = toMinutes(time);
  if (v >= 360 && v < 720) return "morning";
  if (v >= 720 && v < 1020) return "noon";
  if (v >= 1020 && v < 1260) return "evening";
  return "night";
}

export const WEEKDAYS = [
  { value: 1, short: "M", label: "Monday" },
  { value: 2, short: "T", label: "Tuesday" },
  { value: 3, short: "W", label: "Wednesday" },
  { value: 4, short: "T", label: "Thursday" },
  { value: 5, short: "F", label: "Friday" },
  { value: 6, short: "S", label: "Saturday" },
  { value: 0, short: "S", label: "Sunday" },
];

export const unitsForForm = (value: string) => findMedForm(value).units;

export const medFormLabel = (value: string) =>
  MED_FORMS.find((f) => f.value === value)?.label ?? value;

export const medFormIcon = (value: string): LucideIcon =>
  MED_FORMS.find((f) => f.value === value)?.icon ?? Droplets;

export const FREQUENCIES = [
  { value: "every_day", label: "Every day" },
  { value: "every_other_day", label: "Every other day" },
  { value: "as_needed", label: "As needed" },
  { value: "specific_days", label: "Specific days" },
];

export const frequencyLabel = (value: string) =>
  FREQUENCIES.find((f) => f.value === value)?.label ?? value;

export const MEAL_CONTEXTS = [
  { value: "anytime", label: "Anytime" },
  { value: "fasting", label: "Fasting" },
  { value: "before_meal", label: "Before meal" },
  { value: "with_meal", label: "With meal" },
  { value: "after_meal", label: "After meal" },
];

export const mealContextLabel = (value?: string) =>
  MEAL_CONTEXTS.find((m) => m.value === value)?.label ?? "Anytime";

/** Small offline dictionary of common brand → generic equivalents. */
const GENERICS: Record<string, string> = {
  glucophage: "Metformin",
  januvia: "Sitagliptin",
  lipitor: "Atorvastatin",
  crestor: "Rosuvastatin",
  zestril: "Lisinopril",
  prinivil: "Lisinopril",
  norvasc: "Amlodipine",
  lantus: "Insulin glargine",
  humalog: "Insulin lispro",
  ozempic: "Semaglutide",
  ventolin: "Salbutamol",
  synthroid: "Levothyroxine",
  panadol: "Paracetamol",
  tylenol: "Paracetamol",
  advil: "Ibuprofen",
  nexium: "Esomeprazole",
};

export function genericFor(name: string): string | null {
  const key = name.trim().toLowerCase();
  if (!key) return null;
  const hit = Object.keys(GENERICS).find((brand) => key.startsWith(brand));
  return hit ? GENERICS[hit]! : null;
}

/** A medication is archived when its end date is in the past. */
export function isPastMedication(med: Medication, now = new Date()): boolean {
  if (!med.endDate) return false;
  const end = new Date(med.endDate);
  if (Number.isNaN(end.getTime())) return false;
  end.setHours(23, 59, 59, 999);
  return end.getTime() < now.getTime();
}
