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
  ],
  "Obesity": [
    "Weight (kg)",
    "BMI",
    "Waist circumference (cm)",
    "Blood pressure (mmHg)"
  ],
  "Metabolic Syndrome": [
    "Weight (kg)",
    "Waist circumference (cm)",
    "Blood glucose (mg/dL)",
    "Triglycerides (mg/dL)",
    "Blood pressure (mmHg)"
  ],
  "Insulin Resistance": [
    "Blood glucose (mg/dL)",
    "HbA1c (%)",
    "Weight (kg)"
  ],
  "Diabetic Neuropathy": [
    "Blood glucose (mg/dL)",
    "HbA1c (%)",
    "Pain level (1-10)"
  ],
  "Diabetic Retinopathy": [
    "Blood glucose (mg/dL)",
    "HbA1c (%)",
    "Blood pressure (mmHg)"
  ],
  "Diabetic Nephropathy": [
    "Blood glucose (mg/dL)",
    "Creatinine (mg/dL)",
    "eGFR (mL/min)",
    "Blood pressure (mmHg)"
  ],
  "Hypoglycemia": [
    "Blood glucose (mg/dL)"
  ],
  "Cushing's Syndrome": [
    "Blood pressure (mmHg)",
    "Blood glucose (mg/dL)",
    "Weight (kg)"
  ],
  "Addison's Disease": [
    "Blood pressure (mmHg)",
    "Sodium (mmol/L)",
    "Potassium (mmol/L)",
    "Weight (kg)"
  ],
  "Thyroid Nodules": [
    "TSH (mIU/L)",
    "Free T4 (ng/dL)"
  ],
  "Graves' Disease": [
    "TSH (mIU/L)",
    "Free T3 (pg/mL)",
    "Free T4 (ng/dL)",
    "Heart rate (bpm)"
  ],
  "Goiter": [
    "TSH (mIU/L)",
    "Free T4 (ng/dL)"
  ],
  "Hyperparathyroidism": [
    "Calcium (mg/dL)",
    "Vitamin D (ng/mL)"
  ],
  "Vitamin D Deficiency": [
    "Vitamin D (ng/mL)",
    "Calcium (mg/dL)"
  ],
  "Vitamin B12 Deficiency": [
    "Hemoglobin (g/dL)",
    "Fatigue (1-10)"
  ],
  "Iron Deficiency Anemia": [
    "Hemoglobin (g/dL)",
    "Ferritin (ng/mL)",
    "Fatigue (1-10)"
  ],
  "Thalassemia": [
    "Hemoglobin (g/dL)",
    "Ferritin (ng/mL)"
  ],
  "Hemophilia": [
    "Hemoglobin (g/dL)",
    "Pain level (1-10)"
  ],
  "Leukemia": [
    "WBC count (10^9/L)",
    "Hemoglobin (g/dL)",
    "Platelet count (10^9/L)",
    "Body temperature (°C)"
  ],
  "Lymphoma": [
    "WBC count (10^9/L)",
    "Weight (kg)",
    "Body temperature (°C)"
  ],
  "Breast Cancer": [
    "Weight (kg)",
    "Pain level (1-10)"
  ],
  "Prostate Cancer": [
    "PSA (ng/mL)",
    "Weight (kg)"
  ],
  "Lung Cancer": [
    "SpO2 (%)",
    "Weight (kg)",
    "Respiratory rate (bpm)"
  ],
  "Colorectal Cancer": [
    "Weight (kg)",
    "Hemoglobin (g/dL)"
  ],
  "Thyroid Cancer": [
    "TSH (mIU/L)",
    "Free T4 (ng/dL)"
  ],
  "Skin Cancer (Melanoma)": [
    "Weight (kg)"
  ],
  "Stroke": [
    "Blood pressure (mmHg)",
    "Heart rate (bpm)",
    "Blood glucose (mg/dL)"
  ],
  "Transient Ischemic Attack (TIA)": [
    "Blood pressure (mmHg)",
    "Heart rate (bpm)"
  ],
  "Peripheral Artery Disease": [
    "Blood pressure (mmHg)",
    "Pain level (1-10)",
    "Total Cholesterol (mg/dL)"
  ],
  "Deep Vein Thrombosis": [
    "INR",
    "Pain level (1-10)"
  ],
  "Pulmonary Embolism": [
    "SpO2 (%)",
    "Heart rate (bpm)",
    "Respiratory rate (bpm)"
  ],
  "Varicose Veins": [
    "Pain level (1-10)",
    "Weight (kg)"
  ],
  "Cardiomyopathy": [
    "Blood pressure (mmHg)",
    "Heart rate (bpm)",
    "Weight (kg)"
  ],
  "Myocardial Infarction (Heart Attack)": [
    "Blood pressure (mmHg)",
    "Heart rate (bpm)",
    "LDL (mg/dL)"
  ],
  "Angina": [
    "Blood pressure (mmHg)",
    "Heart rate (bpm)",
    "Pain level (1-10)"
  ],
  "Heart Valve Disease": [
    "Heart rate (bpm)",
    "Blood pressure (mmHg)",
    "SpO2 (%)"
  ],
  "Pericarditis": [
    "Body temperature (°C)",
    "Heart rate (bpm)",
    "Pain level (1-10)"
  ],
  "Postural Orthostatic Tachycardia Syndrome (POTS)": [
    "Heart rate (bpm)",
    "Blood pressure (mmHg)",
    "Water intake (L)"
  ],
  "Low Blood Pressure (Hypotension)": [
    "Blood pressure (mmHg)",
    "Heart rate (bpm)",
    "Water intake (L)"
  ],
  "Bronchitis": [
    "SpO2 (%)",
    "Body temperature (°C)",
    "Respiratory rate (bpm)"
  ],
  "Pneumonia": [
    "Body temperature (°C)",
    "SpO2 (%)",
    "Respiratory rate (bpm)"
  ],
  "Tuberculosis": [
    "Body temperature (°C)",
    "Weight (kg)",
    "SpO2 (%)"
  ],
  "Pulmonary Fibrosis": [
    "SpO2 (%)",
    "Respiratory rate (bpm)",
    "Peak flow (L/min)"
  ],
  "Cystic Fibrosis": [
    "SpO2 (%)",
    "Weight (kg)",
    "Peak flow (L/min)"
  ],
  "Allergic Rhinitis": [
    "Peak flow (L/min)"
  ],
  "Chronic Sinusitis": [
    "Pain level (1-10)",
    "Body temperature (°C)"
  ],
  "Insomnia": [
    "Sleep duration (hrs)",
    "Mood (1-10)"
  ],
  "Restless Legs Syndrome": [
    "Sleep duration (hrs)",
    "Pain level (1-10)"
  ],
  "Narcolepsy": [
    "Sleep duration (hrs)"
  ],
  "Chronic Fatigue Syndrome": [
    "Fatigue (1-10)",
    "Sleep duration (hrs)",
    "Pain level (1-10)"
  ],
  "Post-Traumatic Stress Disorder (PTSD)": [
    "Sleep duration (hrs)",
    "Mood (1-10)",
    "Heart rate (bpm)"
  ],
  "Obsessive-Compulsive Disorder (OCD)": [
    "Mood (1-10)",
    "Sleep duration (hrs)"
  ],
  "Panic Disorder": [
    "Heart rate (bpm)",
    "Mood (1-10)"
  ],
  "Schizophrenia": [
    "Sleep duration (hrs)",
    "Weight (kg)"
  ],
  "Eating Disorder": [
    "Weight (kg)",
    "BMI",
    "Mood (1-10)"
  ],
  "Substance Use Disorder": [
    "Mood (1-10)",
    "Sleep duration (hrs)"
  ],
  "Autism Spectrum Disorder": [
    "Sleep duration (hrs)",
    "Mood (1-10)"
  ],
  "Chronic Pain Syndrome": [
    "Pain level (1-10)",
    "Sleep duration (hrs)"
  ],
  "Sciatica": [
    "Pain level (1-10)"
  ],
  "Herniated Disc": [
    "Pain level (1-10)"
  ],
  "Chronic Lower Back Pain": [
    "Pain level (1-10)",
    "Weight (kg)"
  ],
  "Carpal Tunnel Syndrome": [
    "Pain level (1-10)"
  ],
  "Tendonitis": [
    "Pain level (1-10)"
  ],
  "Frozen Shoulder": [
    "Pain level (1-10)"
  ],
  "Ankylosing Spondylitis": [
    "Pain level (1-10)"
  ],
  "Psoriatic Arthritis": [
    "Pain level (1-10)"
  ],
  "Scoliosis": [
    "Pain level (1-10)"
  ],
  "Muscular Dystrophy": [
    "Weight (kg)",
    "Pain level (1-10)"
  ],
  "Myasthenia Gravis": [
    "Fatigue (1-10)",
    "Respiratory rate (bpm)"
  ],
  "Peripheral Neuropathy": [
    "Pain level (1-10)",
    "Blood glucose (mg/dL)"
  ],
  "Trigeminal Neuralgia": [
    "Pain level (1-10)"
  ],
  "Cluster Headache": [
    "Pain level (1-10)",
    "Sleep duration (hrs)"
  ],
  "Vertigo": [
    "Blood pressure (mmHg)",
    "Heart rate (bpm)"
  ],
  "Meniere's Disease": [
    "Pain level (1-10)"
  ],
  "Tinnitus": [
    "Sleep duration (hrs)"
  ],
  "Glaucoma": [
    "Blood pressure (mmHg)"
  ],
  "Cataracts": [
    "Blood glucose (mg/dL)"
  ],
  "Macular Degeneration": [
    "Blood pressure (mmHg)"
  ],
  "Dry Eye Syndrome": [
    "Pain level (1-10)"
  ],
  "Peptic Ulcer Disease": [
    "Pain level (1-10)",
    "Hemoglobin (g/dL)"
  ],
  "Gallstones": [
    "Pain level (1-10)",
    "Weight (kg)"
  ],
  "Pancreatitis": [
    "Pain level (1-10)",
    "Blood glucose (mg/dL)",
    "Weight (kg)"
  ],
  "Diverticulitis": [
    "Pain level (1-10)",
    "Body temperature (°C)"
  ],
  "Hemorrhoids": [
    "Pain level (1-10)"
  ],
  "Chronic Constipation": [
    "Water intake (L)",
    "Pain level (1-10)"
  ],
  "Lactose Intolerance": [
    "Pain level (1-10)",
    "Weight (kg)"
  ],
  "Food Allergy": [
    "Pain level (1-10)"
  ],
  "Gastroparesis": [
    "Blood glucose (mg/dL)",
    "Weight (kg)",
    "Pain level (1-10)"
  ],
  "Urinary Tract Infection": [
    "Body temperature (°C)",
    "Pain level (1-10)",
    "Water intake (L)"
  ],
  "Overactive Bladder": [
    "Water intake (L)"
  ],
  "Nephrotic Syndrome": [
    "Creatinine (mg/dL)",
    "eGFR (mL/min)",
    "Blood pressure (mmHg)",
    "Weight (kg)"
  ],
  "Dialysis (ESRD)": [
    "Weight (kg)",
    "Blood pressure (mmHg)",
    "Potassium (mmol/L)",
    "Creatinine (mg/dL)"
  ],
  "Kidney Transplant": [
    "Creatinine (mg/dL)",
    "eGFR (mL/min)",
    "Blood pressure (mmHg)"
  ],
  "Liver Transplant": [
    "ALT (U/L)",
    "AST (U/L)",
    "Bilirubin (mg/dL)"
  ],
  "Autoimmune Hepatitis": [
    "ALT (U/L)",
    "AST (U/L)",
    "Bilirubin (mg/dL)"
  ],
  "Sjogren's Syndrome": [
    "Pain level (1-10)",
    "Fatigue (1-10)"
  ],
  "Scleroderma": [
    "Pain level (1-10)",
    "Blood pressure (mmHg)"
  ],
  "Vasculitis": [
    "Blood pressure (mmHg)",
    "Body temperature (°C)",
    "Pain level (1-10)"
  ],
  "Sarcoidosis": [
    "SpO2 (%)",
    "Calcium (mg/dL)",
    "Body temperature (°C)"
  ],
  "Raynaud's Phenomenon": [
    "Pain level (1-10)",
    "Body temperature (°C)"
  ],
  "Menopause": [
    "Weight (kg)",
    "Sleep duration (hrs)",
    "Mood (1-10)"
  ],
  "Infertility": [
    "Weight (kg)",
    "Mood (1-10)"
  ],
  "Pregnancy": [
    "Weight (kg)",
    "Blood pressure (mmHg)",
    "Blood glucose (mg/dL)"
  ],
  "Preeclampsia": [
    "Blood pressure (mmHg)",
    "Weight (kg)"
  ],
  "Uterine Fibroids": [
    "Pain level (1-10)",
    "Hemoglobin (g/dL)"
  ],
  "Erectile Dysfunction": [
    "Blood glucose (mg/dL)",
    "Blood pressure (mmHg)"
  ],
  "Low Testosterone": [
    "Weight (kg)",
    "Fatigue (1-10)",
    "Mood (1-10)"
  ],
  "Acne": [
    "Pain level (1-10)"
  ],
  "Rosacea": [
    "Pain level (1-10)"
  ],
  "Vitiligo": [
    "Mood (1-10)"
  ],
  "Hidradenitis Suppurativa": [
    "Pain level (1-10)",
    "Weight (kg)"
  ],
  "Chronic Urticaria (Hives)": [
    "Pain level (1-10)"
  ],
  "Cellulitis": [
    "Body temperature (°C)",
    "Pain level (1-10)"
  ],
  "Wound Care / Ulcer": [
    "Pain level (1-10)",
    "Blood glucose (mg/dL)"
  ],
  "Lyme Disease": [
    "Body temperature (°C)",
    "Pain level (1-10)",
    "Fatigue (1-10)"
  ],
  "Malaria": [
    "Body temperature (°C)",
    "Hemoglobin (g/dL)"
  ],
  "Dengue Fever": [
    "Body temperature (°C)",
    "Platelet count (10^9/L)"
  ],
  "Typhoid Fever": [
    "Body temperature (°C)",
    "Water intake (L)"
  ],
  "COVID-19": [
    "Body temperature (°C)",
    "SpO2 (%)",
    "Heart rate (bpm)"
  ],
  "Influenza": [
    "Body temperature (°C)",
    "SpO2 (%)"
  ],
  "Shingles": [
    "Pain level (1-10)"
  ],
  "Chronic Venous Insufficiency": [
    "Pain level (1-10)",
    "Weight (kg)"
  ],
  "Lymphedema": [
    "Weight (kg)",
    "Pain level (1-10)"
  ],
  "Bariatric Surgery Follow-up": [
    "Weight (kg)",
    "BMI",
    "Vitamin D (ng/mL)",
    "Hemoglobin (g/dL)"
  ],
  "Smoking Cessation": [
    "Heart rate (bpm)",
    "SpO2 (%)",
    "Weight (kg)"
  ],
  "General Wellness": [
    "Weight (kg)",
    "Steps (count)",
    "Sleep duration (hrs)",
    "Blood pressure (mmHg)"
  ],
};

/** Every metric that appears in the seed dictionary, used as the universal picker list. */
export const UNIVERSAL_METRICS: string[] = ([
  "BMI",
  "Bilirubin (mg/dL)",
  "Calcium (mg/dL)",
  "Fatigue (1-10)",
  "Ferritin (ng/mL)",
  "INR",
  "Mood (1-10)",
  "PSA (ng/mL)",
  "Platelet count (10^9/L)",
  "Potassium (mmol/L)",
  "Sodium (mmol/L)",
  "Steps (count)",
  "Vitamin D (ng/mL)",
  "WBC count (10^9/L)",
  "Waist circumference (cm)",
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
] as string[]).sort((a, b) => a.localeCompare(b));

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
