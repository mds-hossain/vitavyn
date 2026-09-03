/* Clinical seed dictionary: condition -> commonly tracked metrics. */
export const CONDITION_SEED: Record<string, string[]> = {
  "Type 1 Diabetes": [
    "Blood glucose (mg/dL)",
    "HbA1c (%)",
    "Weight (kg)"
  ],
  "Type 2 Diabetes": [
    "Blood glucose (mg/dL)",
    "HbA1c (%)",
    "Weight (kg)"
  ],
  "Prediabetes": [
    "Blood glucose (mg/dL)",
    "HbA1c (%)",
    "Weight (kg)"
  ],
  "Gestational Diabetes": [
    "Blood glucose (mg/dL)",
    "Weight (kg)"
  ],
  "Hypertension": [
    "Blood pressure (mmHg)",
    "Heart rate (bpm)",
    "Weight (kg)"
  ],
  "Coronary Artery Disease": [
    "Blood pressure (mmHg)",
    "Heart rate (bpm)",
    "Total Cholesterol (mg/dL)",
    "LDL (mg/dL)"
  ],
  "Heart Failure": [
    "Blood pressure (mmHg)",
    "Heart rate (bpm)",
    "Weight (kg)",
    "SpO2 (%)"
  ],
  "Atrial Fibrillation": [
    "Heart rate (bpm)",
    "Blood pressure (mmHg)"
  ],
  "High Cholesterol": [
    "Total Cholesterol (mg/dL)",
    "LDL (mg/dL)",
    "HDL (mg/dL)",
    "Triglycerides (mg/dL)"
  ],
  "Hypothyroidism": [
    "TSH (mIU/L)",
    "Free T3 (pg/mL)",
    "Free T4 (ng/dL)",
    "Weight (kg)"
  ],
  "Hyperthyroidism": [
    "TSH (mIU/L)",
    "Free T3 (pg/mL)",
    "Free T4 (ng/dL)",
    "Heart rate (bpm)",
    "Weight (kg)"
  ],
  "Hashimoto's Thyroiditis": [
    "TSH (mIU/L)",
    "Free T4 (ng/dL)"
  ],
  "Asthma": [
    "SpO2 (%)",
    "Peak flow (L/min)",
    "Respiratory rate (bpm)"
  ],
  "COPD": [
    "SpO2 (%)",
    "Peak flow (L/min)",
    "Respiratory rate (bpm)"
  ],
  "Sleep Apnea": [
    "SpO2 (%)",
    "Sleep duration (hrs)",
    "Blood pressure (mmHg)"
  ],
  "Chronic Kidney Disease": [
    "eGFR (mL/min)",
    "Creatinine (mg/dL)",
    "Blood pressure (mmHg)"
  ],
  "Kidney Stones": [
    "Water intake (L)",
    "Pain level (1-10)"
  ],
  "Fatty Liver Disease (NAFLD)": [
    "AST (U/L)",
    "ALT (U/L)",
    "Weight (kg)"
  ],
  "Cirrhosis": [
    "AST (U/L)",
    "ALT (U/L)",
    "Weight (kg)"
  ],
  "GERD": [
    "Pain level (1-10)"
  ],
  "Irritable Bowel Syndrome (IBS)": [
    "Pain level (1-10)",
    "Weight (kg)"
  ],
  "Crohn's Disease": [
    "Pain level (1-10)",
    "Weight (kg)",
    "Body temperature (°C)"
  ],
  "Ulcerative Colitis": [
    "Pain level (1-10)",
    "Weight (kg)"
  ],
  "Celiac Disease": [
    "Weight (kg)"
  ],
  "Osteoarthritis": [
    "Pain level (1-10)",
    "Weight (kg)"
  ],
  "Rheumatoid Arthritis": [
    "Pain level (1-10)"
  ],
  "Osteoporosis": [
    "Weight (kg)"
  ],
  "Fibromyalgia": [
    "Pain level (1-10)",
    "Sleep duration (hrs)"
  ],
  "Gout": [
    "Pain level (1-10)",
    "Uric acid (mg/dL)"
  ],
  "Lupus (SLE)": [
    "Pain level (1-10)",
    "Body temperature (°C)"
  ],
  "Multiple Sclerosis": [
    "Pain level (1-10)"
  ],
  "Parkinson's Disease": [
    "Weight (kg)",
    "Heart rate (bpm)"
  ],
  "Alzheimer's Disease": [
    "Weight (kg)",
    "Sleep duration (hrs)"
  ],
  "Epilepsy": [
    "Sleep duration (hrs)"
  ],
  "Migraine": [
    "Pain level (1-10)",
    "Sleep duration (hrs)"
  ],
  "Depression": [
    "Sleep duration (hrs)"
  ],
  "Anxiety Disorder": [
    "Heart rate (bpm)",
    "Sleep duration (hrs)"
  ],
  "Bipolar Disorder": [
    "Sleep duration (hrs)"
  ],
  "ADHD": [
    "Sleep duration (hrs)"
  ],
  "PCOS": [
    "Weight (kg)",
    "Blood glucose (mg/dL)"
  ],
  "Endometriosis": [
    "Pain level (1-10)"
  ],
  "BPH (Enlarged Prostate)": [
    "Pain level (1-10)"
  ],
  "Psoriasis": [
    "Pain level (1-10)"
  ],
  "Eczema": [
    "Pain level (1-10)"
  ],
  "Anemia": [
    "Hemoglobin (g/dL)",
    "Heart rate (bpm)"
  ],
  "Sickle Cell Disease": [
    "Pain level (1-10)",
    "SpO2 (%)"
  ],
  "HIV/AIDS": [
    "CD4 count (cells/mm3)",
    "Viral load (copies/mL)",
    "Weight (kg)"
  ],
  "Hepatitis B": [
    "AST (U/L)",
    "ALT (U/L)"
  ],
  "Hepatitis C": [
    "AST (U/L)",
    "ALT (U/L)"
  ],
  "Long COVID": [
    "SpO2 (%)",
    "Heart rate (bpm)",
    "Pain level (1-10)"
  ]
} as const;

/** Every metric that appears in the seed dictionary, used as the universal picker list. */
export const UNIVERSAL_METRICS: string[] = [
  "ALT (U/L)",
  "AST (U/L)",
  "Blood glucose (mg/dL)",
  "Blood pressure (mmHg)",
  "Body temperature (°C)",
  "CD4 count (cells/mm3)",
  "Creatinine (mg/dL)",
  "Free T3 (pg/mL)",
  "Free T4 (ng/dL)",
  "HDL (mg/dL)",
  "HbA1c (%)",
  "Heart rate (bpm)",
  "Hemoglobin (g/dL)",
  "LDL (mg/dL)",
  "Pain level (1-10)",
  "Peak flow (L/min)",
  "Respiratory rate (bpm)",
  "Sleep duration (hrs)",
  "SpO2 (%)",
  "TSH (mIU/L)",
  "Total Cholesterol (mg/dL)",
  "Triglycerides (mg/dL)",
  "Uric acid (mg/dL)",
  "Viral load (copies/mL)",
  "Water intake (L)",
  "Weight (kg)",
  "eGFR (mL/min)"
];

export const CONDITION_NAMES: string[] = Object.keys(CONDITION_SEED);

export function metricsForCondition(name: string): string[] {
  const key = CONDITION_NAMES.find((c) => c.toLowerCase() === name.trim().toLowerCase());
  return key ? [...CONDITION_SEED[key]!] : [];
}

const KIND_MATCHERS: { match: RegExp; kind: string }[] = [
  { match: /blood glucose/i, kind: "glucose" },
  { match: /hba1c/i, kind: "hba1c" },
  { match: /blood pressure/i, kind: "blood_pressure" },
  { match: /weight/i, kind: "weight" },
  { match: /heart rate/i, kind: "heart_rate" },
  { match: /temperature/i, kind: "temperature" },
  { match: /cholesterol|ldl|hdl|triglycer/i, kind: "cholesterol" },
];

/** Map a tracked-metric label to a built-in measurement kind, when one exists. */
export function kindForMetric(metric: string): string | undefined {
  return KIND_MATCHERS.find((m) => m.match.test(metric))?.kind;
}
