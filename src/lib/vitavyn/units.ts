export const MGDL_PER_MMOL = 18.0182;

export const glucoseToMmol = (mgdl: number) => mgdl / MGDL_PER_MMOL;
export const glucoseToMgdl = (mmol: number) => mmol * MGDL_PER_MMOL;

export const hba1cPercentToMmolMol = (percent: number) => (percent - 2.15) * 10.929;
export const hba1cMmolMolToPercent = (mmolMol: number) => mmolMol / 10.929 + 2.15;

export const kgToLb = (kg: number) => kg * 2.2046226218;
export const lbToKg = (lb: number) => lb / 2.2046226218;

export const cToF = (c: number) => (c * 9) / 5 + 32;
export const fToC = (f: number) => ((f - 32) * 5) / 9;

export const cmToInches = (cm: number) => cm / 2.54;
export const inchesToCm = (inches: number) => inches * 2.54;

export const cmToFeetInches = (cm: number) => {
  const totalIn = cmToInches(cm);
  const feet = Math.floor(totalIn / 12);
  return { feet, inches: Math.round((totalIn - feet * 12) * 10) / 10 };
};

export const mlToOz = (ml: number) => ml / 29.5735295625;
export const ozToMl = (oz: number) => oz * 29.5735295625;

export const round = (value: number, digits = 1) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

export function formatGlucose(mgdl: number, unit: "mg/dL" | "mmol/L") {
  return unit === "mg/dL"
    ? `${round(mgdl, 0)} mg/dL`
    : `${round(glucoseToMmol(mgdl), 1)} mmol/L`;
}

export function formatWeight(kg: number, unit: "kg" | "lb") {
  return unit === "kg" ? `${round(kg, 1)} kg` : `${round(kgToLb(kg), 1)} lb`;
}

export function formatTemp(celsius: number, unit: "°C" | "°F") {
  return unit === "°C" ? `${round(celsius, 1)} °C` : `${round(cToF(celsius), 1)} °F`;
}

/* ---------------- Unit engine ---------------- */

export type UnitDef = {
  value: string;
  label: string;
  toCanonical: (n: number) => number;
  fromCanonical: (n: number) => number;
  digits: number;
};

const identity = (n: number) => n;

const def = (
  value: string,
  label: string,
  digits: number,
  toCanonical: (n: number) => number = identity,
  fromCanonical: (n: number) => number = identity,
): UnitDef => ({ value, label, digits, toCanonical, fromCanonical });

export const CHOL_MGDL_PER_MMOL = 38.67;

export const KIND_UNITS: Record<string, { canonical: string; units: UnitDef[] }> = {
  glucose: {
    canonical: "mg/dL",
    units: [
      def("mg/dL", "mg/dL", 0),
      def("mmol/L", "mmol/L", 1, glucoseToMgdl, glucoseToMmol),
    ],
  },
  cholesterol: {
    canonical: "mg/dL",
    units: [
      def("mg/dL", "mg/dL", 0),
      def("mmol/L", "mmol/L", 2, (n) => n * CHOL_MGDL_PER_MMOL, (n) => n / CHOL_MGDL_PER_MMOL),
    ],
  },
  weight: {
    canonical: "kg",
    units: [def("kg", "kg", 1), def("lb", "lb", 1, lbToKg, kgToLb)],
  },
  temperature: {
    canonical: "°C",
    units: [def("°C", "°C", 1), def("°F", "°F", 1, fToC, cToF)],
  },
  hba1c: {
    canonical: "%",
    units: [
      def("%", "%", 1),
      def("mmol/mol", "mmol/mol", 0, hba1cMmolMolToPercent, hba1cPercentToMmolMol),
    ],
  },
  blood_pressure: { canonical: "mmHg", units: [def("mmHg", "mmHg", 0)] },
  heart_rate: { canonical: "bpm", units: [def("bpm", "bpm", 0)] },
  custom: { canonical: "", units: [] },
};

export function unitsFor(kind: string): UnitDef[] {
  return KIND_UNITS[kind]?.units ?? [];
}

export function canonicalUnit(kind: string): string {
  return KIND_UNITS[kind]?.canonical ?? "";
}

export function findUnit(kind: string, unit: string): UnitDef | undefined {
  return unitsFor(kind).find((u) => u.value === unit);
}

/** Convert an entered value in `unit` into the kind's canonical unit. */
export function toCanonicalValue(kind: string, unit: string, value: number): number {
  return findUnit(kind, unit)?.toCanonical(value) ?? value;
}

/** Convert a stored canonical value into the requested display unit. */
export function fromCanonicalValue(kind: string, unit: string, value: number): number {
  return findUnit(kind, unit)?.fromCanonical(value) ?? value;
}

export type UnitPrefs = { glucoseUnit: string; weightUnit: string; tempUnit: string };

/** The unit a value of this kind should be *shown* in, given user preferences. */
export function preferredUnit(kind: string, prefs: UnitPrefs, storedUnit: string): string {
  if (kind === "glucose") return prefs.glucoseUnit;
  if (kind === "weight") return prefs.weightUnit;
  if (kind === "temperature") return prefs.tempUnit;
  // Concentration-style metrics (cholesterol, etc.) follow the mg/dL vs mmol/L preference.
  if (findUnit(kind, prefs.glucoseUnit)) return prefs.glucoseUnit;
  if (storedUnit && findUnit(kind, storedUnit)) return storedUnit;
  return canonicalUnit(kind) || storedUnit;
}

/** Format a stored (canonical) measurement for display in the user's preferred unit. */
export function formatMeasurement(
  kind: string,
  storedUnit: string,
  value: number,
  prefs: UnitPrefs,
): string {
  const target = preferredUnit(kind, prefs, storedUnit);
  const unitDef = findUnit(kind, target);
  if (!unitDef) return `${round(value, 2)} ${storedUnit}`.trim();
  return `${round(unitDef.fromCanonical(value), unitDef.digits)} ${target}`;
}
