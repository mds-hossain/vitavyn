import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { buildDemoData } from "./demo";
import type { Preferences, Profile, TimelineEvent, VitavynData } from "./types";

const STORAGE_KEY = "vitavyn:data:v1";

type Ctx = {
  data: VitavynData;
  hydrated: boolean;
  update: (fn: (draft: VitavynData) => VitavynData) => void;
  add: <K extends CollectionKey>(key: K, item: Omit<VitavynData[K][number], keyof Stamp>) => void;
  updateItem: <K extends CollectionKey>(
    key: K,
    id: string,
    patch: Partial<VitavynData[K][number]>,
  ) => void;
  remove: (key: CollectionKey, id: string) => void;
  setPreferences: (p: Partial<Preferences>) => void;
  setProfile: (p: Partial<Profile>) => void;
  resetDemo: () => void;
  clearAll: () => void;
};

type Stamp = { id: string; createdAt: string; updatedAt: string; deletedAt?: string | null };

export type CollectionKey =
  | "conditions"
  | "measurements"
  | "medications"
  | "medicationLogs"
  | "symptoms"
  | "providers"
  | "appointments"
  | "labResults"
  | "records"
  | "meals"
  | "tasks";

const VitavynContext = createContext<Ctx | null>(null);

function stamp() {
  const now = new Date().toISOString();
  return {
    id: (globalThis.crypto?.randomUUID?.() ?? `id-${Math.random().toString(36).slice(2)}`) as string,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };
}

export function VitavynProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<VitavynData>(() => buildDemoData());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setData(JSON.parse(raw) as VitavynData);
    } catch {
      /* ignore corrupted local data */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* storage full or unavailable */
    }
  }, [data, hydrated]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", data.preferences.theme === "dark");
  }, [data.preferences.theme]);

  const update = useCallback((fn: (draft: VitavynData) => VitavynData) => {
    setData((prev) => fn(structuredClone(prev)));
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      data,
      hydrated,
      update,
      add: (key, item) =>
        update((draft) => {
          (draft[key] as unknown as Record<string, unknown>[]).unshift({
            ...stamp(),
            ...(item as Record<string, unknown>),
          });
          return draft;
        }),
      remove: (key, id) =>
        update((draft) => {
          draft[key] = (draft[key] as { id: string }[]).filter((row) => row.id !== id) as never;
          return draft;
        }),
      setPreferences: (p) =>
        update((draft) => {
          draft.preferences = { ...draft.preferences, ...p };
          return draft;
        }),
      setProfile: (p) =>
        update((draft) => {
          draft.profile = { ...draft.profile, ...p };
          return draft;
        }),
      resetDemo: () => setData(buildDemoData()),
      clearAll: () =>
        setData(() => {
          const empty = buildDemoData();
          return {
            ...empty,
            profile: { ...empty.profile, onboarded: true },
            conditions: [],
            measurements: [],
            medications: [],
            medicationLogs: [],
            symptoms: [],
            providers: [],
            appointments: [],
            labResults: [],
            records: [],
            meals: [],
            tasks: [],
          };
        }),
    }),
    [data, hydrated, update],
  );

  return <VitavynContext.Provider value={value}>{children}</VitavynContext.Provider>;
}

export function useVitavyn() {
  const ctx = useContext(VitavynContext);
  if (!ctx) throw new Error("useVitavyn must be used inside VitavynProvider");
  return ctx;
}

export function buildTimeline(data: VitavynData): TimelineEvent[] {
  const events: TimelineEvent[] = [
    ...data.measurements.map((m) => ({
      id: m.id,
      at: m.takenAt,
      type: "measurement" as const,
      title: m.label,
      detail:
        m.kind === "blood_pressure"
          ? `${m.value} / ${m.secondaryValue} ${m.unit}`
          : `${m.value} ${m.unit}${m.context ? ` · ${m.context}` : ""}`,
    })),
    ...data.medicationLogs.map((log) => {
      const med = data.medications.find((m) => m.id === log.medicationId);
      return {
        id: log.id,
        at: log.recordedAt ?? log.scheduledFor,
        type: "medication" as const,
        title: med ? `${med.name} ${med.dose}${med.unit}` : "Medication",
        detail: log.status === "recorded" ? "Dose recorded" : "Dose not recorded",
      };
    }),
    ...data.symptoms.map((s) => ({
      id: s.id,
      at: s.occurredAt,
      type: "symptom" as const,
      title: s.name,
      detail: `Severity ${s.severity}/5`,
    })),
    ...data.meals.map((m) => ({
      id: m.id,
      at: m.eatenAt,
      type: "meal" as const,
      title: m.name,
      detail: `${m.mealType}${m.carbsGrams ? ` · ${m.carbsGrams} g carbs` : ""}`,
    })),
    ...data.appointments.map((a) => ({
      id: a.id,
      at: a.startsAt,
      type: "appointment" as const,
      title: a.title,
      detail: `${a.providerName} · ${a.specialty}`,
    })),
    ...data.labResults.map((l) => ({
      id: l.id,
      at: l.collectedAt,
      type: "lab" as const,
      title: `${l.analyte} (${l.panel})`,
      detail: `${l.value} ${l.unit}`,
    })),
    ...data.records.map((r) => ({
      id: r.id,
      at: r.createdAt,
      type: "record" as const,
      title: r.title,
      detail: r.category,
    })),
  ];
  return events.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
}

export function latestMeasurement(data: VitavynData, kind: string) {
  return data.measurements
    .filter((m) => m.kind === kind)
    .sort((a, b) => new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime())[0];
}
