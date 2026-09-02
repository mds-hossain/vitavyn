import {
  Bandage,
  Droplet,
  Droplets,
  Eye,
  Pill,
  Syringe,
  Tube,
  Wind,
  type LucideIcon,
} from "lucide-react";
import type { Medication } from "./types";

export type MedFormDef = {
  value: string;
  label: string;
  icon: LucideIcon;
  units: string[];
};

/** Medication forms with their allowed measurement units. */
export const MED_FORMS: MedFormDef[] = [
  { value: "tablet", label: "Pill / Tablet / Capsule", icon: Pill, units: ["mg", "mcg", "g"] },
  { value: "insulin_pen", label: "Insulin Pen", icon: Syringe, units: ["IU"] },
  { value: "insulin_vial", label: "Insulin Vial & Syringe", icon: Syringe, units: ["IU"] },
  { value: "liquid", label: "Liquid / Syrup", icon: Droplet, units: ["mL"] },
  { value: "inhaler", label: "Inhaler / Puff", icon: Wind, units: ["Puffs"] },
  { value: "cream", label: "Cream / Ointment", icon: Tube, units: ["mg", "g"] },
  { value: "drops", label: "Drops (Eye / Ear)", icon: Eye, units: ["Drops"] },
  { value: "patch", label: "Patch", icon: Bandage, units: ["mcg", "mg"] },
];

export const findMedForm = (value: string) =>
  MED_FORMS.find((f) => f.value === value) ?? MED_FORMS[0]!;

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
