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
