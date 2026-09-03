import type { VitavynData } from "./types";

const now = new Date();
const iso = (d: Date) => d.toISOString();
const at = (dayOffset: number, hours: number, minutes = 0) => {
  const d = new Date(now);
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hours, minutes, 0, 0);
  return iso(d);
};
const stamp = (id: string) => ({
  id,
  createdAt: iso(now),
  updatedAt: iso(now),
  deletedAt: null,
});

export function buildDemoData(): VitavynData {
  const diabetes = { ...stamp("cond-diabetes") };
  const hypertension = { ...stamp("cond-hypertension") };
  const cholesterol = { ...stamp("cond-cholesterol") };

  const glucosePoints: VitavynData["measurements"] = [];
  const base = [126, 118, 134, 122, 141, 129, 117, 124, 131, 119, 127, 138, 121, 125];
  base.forEach((value, index) => {
    const day = -(base.length - 1 - index);
    glucosePoints.push({
      ...stamp(`glu-${index}`),
      kind: "glucose",
      label: "Blood glucose",
      value,
      unit: "mg/dL",
      context: index % 3 === 0 ? "Fasting" : index % 3 === 1 ? "After meal" : "Bedtime",
      conditionId: diabetes.id,
      takenAt: at(day, 8, 15),
    });
  });

  const bpPoints: VitavynData["measurements"] = [128, 132, 126, 130, 124, 129, 128].map(
    (systolic, index) => ({
      ...stamp(`bp-${index}`),
      kind: "blood_pressure",
      label: "Blood pressure",
      value: systolic,
      secondaryValue: 78 + (index % 3) * 2,
      unit: "mmHg",
      conditionId: hypertension.id,
      takenAt: at(-(6 - index), 18, 30),
    }),
  );

  const weightPoints: VitavynData["measurements"] = [79.4, 79.1, 78.8, 78.6, 78.4].map(
    (kg, index) => ({
      ...stamp(`wt-${index}`),
      kind: "weight",
      label: "Weight",
      value: kg,
      unit: "kg",
      takenAt: at(-(12 - index * 3), 7, 10),
    }),
  );

  return {
    version: 1,
    profile: {
      name: "Shuvoraj Noman",
      dateOfBirth: "1986-04-12",
      bloodType: "B+",
      allergies: ["Penicillin"],
      emergencyContactName: "Nadia Noman",
      emergencyContactPhone: "+49 151 2345 6789",
      notes: "Demonstration profile. All information here is fictional.",
      onboarded: false,
    },
    preferences: {
      glucoseUnit: "mg/dL",
      weightUnit: "kg",
      tempUnit: "°C",
      timeFormat: "24h",
      theme: "light",
      storageTier: "local",
    },
    conditions: [
      {
        ...diabetes,
        name: "Type 2 Diabetes",
        status: "active",
        diagnosedOn: "2019-06-01",
        trackedMetrics: ["Blood glucose", "HbA1c", "Meals"],
      },
      {
        ...hypertension,
        name: "Hypertension",
        status: "active",
        diagnosedOn: "2021-02-14",
        trackedMetrics: ["Blood pressure", "Heart rate"],
      },
      {
        ...cholesterol,
        name: "High Cholesterol",
        status: "monitoring",
        diagnosedOn: "2022-09-30",
        trackedMetrics: ["LDL", "HDL", "Triglycerides"],
      },
    ],
    measurements: [
      ...glucosePoints,
      ...bpPoints,
      ...weightPoints,
      {
        ...stamp("hba1c-1"),
        kind: "hba1c",
        label: "HbA1c",
        value: 6.9,
        unit: "%",
        conditionId: diabetes.id,
        takenAt: at(-45, 9),
      },
    ],
    medications: [
      {
        ...stamp("med-metformin"),
        name: "Metformin",
        dose: "1000",
        unit: "mg",
        form: "tablet",
        frequency: "every_day",
        times: ["08:00", "20:00"],
        startDate: "2019-06-10",
        endDate: null,
        conditionIds: [diabetes.id],
        prescriber: "Dr. Anna Müller",
        refillReminder: true,
      },
      {
        ...stamp("med-sitagliptin"),
        name: "Sitagliptin",
        dose: "100",
        unit: "mg",
        form: "tablet",
        frequency: "every_day",
        times: ["13:00"],
        startDate: "2021-03-01",
        endDate: null,
        conditionIds: [diabetes.id],
        prescriber: "Dr. Anna Müller",
      },
      {
        ...stamp("med-atorvastatin"),
        name: "Atorvastatin",
        dose: "20",
        unit: "mg",
        form: "tablet",
        frequency: "every_day",
        times: ["21:00"],
        startDate: "2022-10-05",
        endDate: null,
        conditionIds: [cholesterol.id],
        prescriber: "Dr. Ibrahim Khan",
      },
    ],
    medicationLogs: [
      {
        ...stamp("log-1"),
        medicationId: "med-metformin",
        scheduledFor: at(0, 8),
        recordedAt: at(0, 8, 6),
        status: "recorded",
      },
      {
        ...stamp("log-2"),
        medicationId: "med-metformin",
        scheduledFor: at(-1, 20),
        recordedAt: at(-1, 20, 12),
        status: "recorded",
      },
    ],
    symptoms: [
      {
        ...stamp("sym-1"),
        name: "Fatigue",
        severity: 3,
        occurredAt: at(0, 16),
        durationMinutes: 90,
        conditionId: diabetes.id,
      },
      {
        ...stamp("sym-2"),
        name: "Headache",
        severity: 2,
        occurredAt: at(-2, 14, 30),
        durationMinutes: 45,
        conditionId: hypertension.id,
      },
    ],
    providers: [
      {
        ...stamp("prov-muller"),
        name: "Dr. Anna Müller",
        specialty: "Endocrinology",
        clinic: "Charité Diabetes Centre",
        phone: "+49 30 1234 5678",
        address: "Luisenstraße 12, Berlin",
      },
      {
        ...stamp("prov-khan"),
        name: "Dr. Ibrahim Khan",
        specialty: "Cardiology",
        clinic: "Herzzentrum Berlin",
        phone: "+49 30 8765 4321",
      },
    ],
    appointments: [
      {
        ...stamp("appt-1"),
        title: "Quarterly diabetes review",
        providerId: "prov-muller",
        providerName: "Dr. Anna Müller",
        specialty: "Endocrinology",
        startsAt: at(1, 10, 30),
        location: "Charité Diabetes Centre",
        purpose: "Review HbA1c and medication plan",
        questions: [
          { id: "q1", text: "Should the evening Metformin dose stay the same?", asked: false },
          { id: "q2", text: "Are my morning readings in a reasonable range?", asked: false },
        ],
        status: "upcoming",
      },
      {
        ...stamp("appt-2"),
        title: "Lipid follow-up",
        providerId: "prov-khan",
        providerName: "Dr. Ibrahim Khan",
        specialty: "Cardiology",
        startsAt: at(21, 9, 0),
        location: "Herzzentrum Berlin",
        purpose: "Cholesterol follow-up",
        questions: [],
        status: "upcoming",
      },
    ],
    labResults: [
      {
        ...stamp("lab-1"),
        panel: "Lipid panel",
        analyte: "LDL",
        value: 3.4,
        unit: "mmol/L",
        referenceLow: 0,
        referenceHigh: 3.0,
        collectedAt: at(-30, 8),
        conditionId: cholesterol.id,
      },
      {
        ...stamp("lab-2"),
        panel: "Lipid panel",
        analyte: "HDL",
        value: 1.2,
        unit: "mmol/L",
        referenceLow: 1.0,
        referenceHigh: 2.5,
        collectedAt: at(-30, 8),
        conditionId: cholesterol.id,
      },
      {
        ...stamp("lab-3"),
        panel: "Diabetes panel",
        analyte: "HbA1c",
        value: 6.9,
        unit: "%",
        referenceLow: 4.0,
        referenceHigh: 5.7,
        collectedAt: at(-45, 9),
        conditionId: "cond-diabetes",
      },
    ],
    records: [
      {
        ...stamp("rec-1"),
        title: "Endocrinology visit summary",
        category: "Visit summary",
        issuedBy: "Dr. Anna Müller",
        issuedOn: at(-45, 11).slice(0, 10),
        fileName: "visit-summary.pdf",
        sizeKb: 184,
      },
      {
        ...stamp("rec-2"),
        title: "Lipid panel report",
        category: "Lab report",
        issuedBy: "Labor Berlin",
        issuedOn: at(-30, 8).slice(0, 10),
        fileName: "lipid-panel.pdf",
        sizeKb: 96,
      },
    ],
    meals: [
      {
        ...stamp("meal-1"),
        name: "Oats with berries",
        mealType: "breakfast",
        carbsGrams: 42,
        calories: 380,
        eatenAt: at(0, 7, 40),
      },
      {
        ...stamp("meal-2"),
        name: "Grilled chicken salad",
        mealType: "lunch",
        carbsGrams: 26,
        calories: 520,
        eatenAt: at(0, 12, 30),
      },
    ],
    tasks: [
      { ...stamp("task-1"), title: "Order Metformin refill", dueDate: at(3, 9), done: false },
      { ...stamp("task-2"), title: "Bring last lab report to review", dueDate: at(1, 9), done: false },
    ],
    customMetrics: [],
  };
}
