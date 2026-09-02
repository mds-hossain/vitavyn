export type ID = string;

export type Stamped = {
  id: ID;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
};

export type GlucoseUnit = "mg/dL" | "mmol/L";
export type WeightUnit = "kg" | "lb";
export type TempUnit = "°C" | "°F";

export type Preferences = {
  glucoseUnit: GlucoseUnit;
  weightUnit: WeightUnit;
  tempUnit: TempUnit;
  theme: "light" | "dark";
  storageTier: "local" | "sync" | "vault";
};

export type Profile = {
  name: string;
  dateOfBirth?: string;
  bloodType?: string;
  allergies: string[];
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  notes?: string;
  onboarded: boolean;
};

export type Condition = Stamped & {
  name: string;
  status: "active" | "monitoring" | "resolved";
  diagnosedOn?: string;
  trackedMetrics: string[];
  notes?: string;
};

export type MeasurementKind =
  | "glucose"
  | "hba1c"
  | "blood_pressure"
  | "weight"
  | "heart_rate"
  | "temperature"
  | "cholesterol"
  | "custom";

export type Measurement = Stamped & {
  kind: MeasurementKind;
  label: string;
  value: number;
  secondaryValue?: number | null;
  unit: string;
  context?: string;
  conditionId?: ID | null;
  takenAt: string;
  notes?: string;
};

export type SlotId = "morning" | "noon" | "evening" | "night" | "custom";

export type MealContext = "fasting" | "before_meal" | "with_meal" | "after_meal" | "anytime";

export type DoseSlot = { slot: SlotId; time: string; mealContext?: MealContext };


export type Medication = Stamped & {
  name: string;
  dose: string;
  unit: string;
  form: string;
  frequency: string;
  times: string[];
  schedule?: DoseSlot[];
  startDate?: string;
  endDate?: string | null;
  conditionIds: ID[];
  prescriber?: string;
  notes?: string;
  refillReminder?: boolean;
};

export type MedicationLog = Stamped & {
  medicationId: ID;
  scheduledFor: string;
  recordedAt?: string | null;
  status: "recorded" | "skipped" | "pending";
};

export type Symptom = Stamped & {
  name: string;
  severity: number;
  occurredAt: string;
  durationMinutes?: number | null;
  conditionId?: ID | null;
  notes?: string;
};

export type Provider = Stamped & {
  name: string;
  specialty: string;
  clinic?: string;
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
};

export type Appointment = Stamped & {
  title: string;
  providerId?: ID | null;
  providerName: string;
  specialty: string;
  startsAt: string;
  location?: string;
  website?: string;
  purpose?: string;
  questions: { id: ID; text: string; asked: boolean }[];
  notes?: string;
  status: "upcoming" | "completed" | "cancelled";
};

export type LabResult = Stamped & {
  panel: string;
  analyte: string;
  value: number;
  unit: string;
  referenceLow?: number | null;
  referenceHigh?: number | null;
  collectedAt: string;
  conditionId?: ID | null;
};

export type MedicalRecord = Stamped & {
  title: string;
  category: string;
  issuedBy?: string;
  issuedOn?: string;
  fileName?: string;
  sizeKb?: number;
  notes?: string;
};

export type Meal = Stamped & {
  name: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  carbsGrams?: number | null;
  calories?: number | null;
  eatenAt: string;
  notes?: string;
};

export type HealthTask = Stamped & {
  title: string;
  dueDate?: string;
  done: boolean;
};

export type VitavynData = {
  version: number;
  profile: Profile;
  preferences: Preferences;
  conditions: Condition[];
  measurements: Measurement[];
  medications: Medication[];
  medicationLogs: MedicationLog[];
  symptoms: Symptom[];
  providers: Provider[];
  appointments: Appointment[];
  labResults: LabResult[];
  records: MedicalRecord[];
  meals: Meal[];
  tasks: HealthTask[];
};

export type TimelineEvent = {
  id: string;
  at: string;
  type: "measurement" | "medication" | "symptom" | "meal" | "appointment" | "record" | "lab";
  title: string;
  detail?: string;
};
